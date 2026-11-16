import Button from "@/components/Button";
import FormField from "@/components/FormField";
import Input from "@/components/Input";
import SegmentedControl from "@/components/SegmentedControl";
import OptionalTag from "./OptionalTag";
import { GOAL_MAX, GOAL_MIN, GOAL_PRESETS } from "../utils/validate";

const presetOptions = GOAL_PRESETS.map((n) => ({ value: String(n), label: String(n) }));

export default function StepGoal({ values, errors, setValue, onSubmit }) {
  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5">
      <h1 className="mb-2 font-serif text-[clamp(1.9rem,4vw,2.5rem)] leading-[1.1] font-normal tracking-[-0.02em] text-balance">
        How many jobs do you want to apply to each week?
      </h1>

      <FormField
        id="weekly_goal"
        label="Applications per week"
        hint="You can change this any time in Settings."
        error={errors.weekly_goal}
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-28">
            <Input
              id="weekly_goal"
              name="weekly_goal"
              type="number"
              inputMode="numeric"
              min={GOAL_MIN}
              max={GOAL_MAX}
              value={values.weekly_goal}
              onChange={(e) => setValue("weekly_goal", e.target.value)}
              error={errors.weekly_goal}
              aria-describedby="weekly_goal-hint"
            />
          </div>
          <SegmentedControl
            name="weekly_goal_preset"
            legend="Quick pick"
            hideLegend
            options={presetOptions}
            value={values.weekly_goal}
            onChange={(v) => setValue("weekly_goal", v)}
          />
        </div>
      </FormField>

      <FormField id="desired_role" label={<>Role you are looking for<OptionalTag /></>}>
        <Input
          id="desired_role"
          name="desired_role"
          maxLength={100}
          value={values.desired_role}
          onChange={(e) => setValue("desired_role", e.target.value)}
        />
      </FormField>

      <FormField id="location" label={<>Where<OptionalTag /></>}>
        <Input
          id="location"
          name="location"
          maxLength={100}
          value={values.location}
          onChange={(e) => setValue("location", e.target.value)}
        />
      </FormField>

      <Button type="submit" variant="primary" fullWidth className="mt-2">
        Continue
      </Button>
    </form>
  );
}