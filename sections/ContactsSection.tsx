"use client";

import { MotionReveal } from "@/components/MotionReveal";
import { SectionFrame } from "@/components/SectionFrame";
import { LogoDots } from "@/components/LogoDots";
import type { InquiryType } from "@/components/ContactDialog";

interface ContactsSectionProps {
  onInquiry: (type: InquiryType) => void;
}

export function ContactsSection({ onInquiry }: ContactsSectionProps) {
  return (
    <SectionFrame
      id="contacts"
      eyebrow="Contact Us"
      className="bg-[#0a0a0a]"
    >
      <div className="flex min-h-[40vh] sm:min-h-[60vh] items-center justify-center pt-16 sm:pt-0">
        <MotionReveal>
          <LogoDots onSelect={onInquiry} />
        </MotionReveal>
      </div>
    </SectionFrame>
  );
}