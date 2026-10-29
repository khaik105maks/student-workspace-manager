import type { MemberView } from "@/modules/membership/adapters/driving/http/list.type";

export interface MemberRowView extends MemberView {
  readonly email: string;
  readonly name: string;
}
