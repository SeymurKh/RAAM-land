import { unlink } from "fs/promises";
import { join } from "path";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { deleteProject, getProject, updateProject } from "@/lib/db";
import type { Project } from "@/types/content";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(project);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = request.cookies.get("admin_token")?.value;
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json()) as Project;
  const project = await updateProject(id, normalizeProject(body));

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(project);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = request.cookies.get("admin_token")?.value;
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Delete image file from disk
  const project = await getProject(id);
  if (project?.image) {
    const possibleExts = ["png", "jpg", "jpeg", "webp", "gif"];
    const uploadDir = join(process.cwd(), "public", "uploads", "projects");
    for (const ext of possibleExts) {
      const filePath = join(uploadDir, `${id}.${ext}`);
      try { await unlink(filePath); } catch { /* ok */ }
    }
  }

  const deleted = await deleteProject(id);
  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
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
