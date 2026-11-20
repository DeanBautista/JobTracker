import { JobMenu } from "@/features/jobs";

export default function MoveMenu(props) {
  return <JobMenu {...props} triggerClassName="absolute top-[7px] right-[7px] z-[5] size-10" />;
}