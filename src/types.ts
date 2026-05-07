export type ZipStatus =
  | "Final"
  | "Active"
  | "Proposed"
  | "Draft"
  | "Reserved"
  | "Withdrawn"
  | "Obsolete";

export interface Zip {
  num: number;
  title: string;
  status: ZipStatus;
  tags: string[];
  summary?: string | null;
}

export interface SandboxModule {
  zip: number;
  Component: React.ComponentType;
  pendingPeerReview?: boolean;
  peerReviewNote?: string;
}
