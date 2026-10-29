import type { ListMemberCase } from "@/modules/membership/application/use-cases/list-member.case";
import type { Member } from "@/modules/membership/domain/member.value";

import type { MemberView } from "./list.type";

export class ListMemberResolver {
  constructor(
    private readonly listMemberCase: ListMemberCase,
    private readonly spaceId: string,
  ) {}

  resolve(): Promise<ReadonlyArray<MemberView>> {
    return this.listMemberCase.execute(this.spaceId).then((members) => members.map(toMemberView));
  }
}

function toMemberView(member: Member): MemberView {
  return { ...member };
}
