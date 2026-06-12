"use client";

import { useState } from "react";
import { MotionReveal } from "@/components/MotionReveal";
import { SectionFrame } from "@/components/SectionFrame";
import { LogoDots } from "@/components/LogoDots";
import { ContactDialog, type InquiryType } from "@/components/ContactDialog";

export function ContactsSection() {
  const [dialogType, setDialogType] = useState<InquiryType | null>(null);

  return (
    <SectionFrame
      id="contacts"
      eyebrow="Contact Us"
      className="bg-[#0a0a0a]"
    >
      <div className="flex min-h-[60vh] items-center justify-center">
        <MotionReveal>
          <LogoDots onSelect={setDialogType} />
        </MotionReveal>
      </div>

      <ContactDialog
        open={dialogType !== null}
        type={dialogType}
        onClose={() => setDialogType(null)}
      />
    </SectionFrame>
  );
}