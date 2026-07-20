import { rename, unlink } from "fs/promises";
import { join } from "path";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { createProject, getProjects } from "@/lib/db";
import type { Project } from "@/types/content";

export async function GET() {
  const projects = await getProjects();
  return NextResponse.json(projects);
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get("admin_token")?.value;
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await request.json()) as Project;
  if (!body.id || !body.title) {
    return NextResponse.json(
      { error: "id and title are required" },
      { status: 400 },
    );
  }
  // Если изображение было загружено с временным именем (new-project-xxx), переименовываем файл
  if (body.image && body.image.includes("/uploads/projects/new-project")) {
    const uploadDir = join(process.cwd(), "public", "uploads", "projects");
    const oldFileName = body.image.split("/").pop()!;
    const ext = oldFileName.split(".").pop()!;
    const newFileName = `${body.id}.${ext}`;
    const oldPath = join(uploadDir, oldFileName);
    const newPath = join(uploadDir, newFileName);

    try {
      // Удаляем старый файл проекта если есть (другое расширение)
      const possibleExts = ["png", "jpg", "jpeg", "webp", "gif"];
      for (const e of possibleExts) {
        if (e === ext) continue;
        const existingPath = join(uploadDir, `${body.id}.${e}`);
        try { await unlink(existingPath); } catch { /* ok */ }
      }
      await rename(oldPath, newPath);
      body.image = `/uploads/projects/${newFileName}`;
    } catch {
      // Продолжаем — файл может не существовать
    }
  }

  const project = await createProject(normalizeProject(body));
  return NextResponse.json(project, { status: 201 });
}

function normalizeProject(project: Project): Project {
  return {
    ...project,
    order: Number(project.order) || 0,
    description: project.description.filter((paragraph) => paragraph.trim()),
    youtubeUrl: project.youtubeUrl?.trim() || undefined,
    image: project.image?.trim() || undefined,
  };
}