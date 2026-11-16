import Button from "@/components/Button";
import FormField from "@/components/FormField";
import Input from "@/components/Input";
import OptionalTag from "./OptionalTag";

export default function StepFirstJob({ values, errors, setValue, onSubmit, onSkip, onBack }) {
  const bind = (name) => ({
    id: name,
    name,
    value: values[name],
    onChange: (e) => setValue(name, e.target.value),
    error: errors[name],
  });

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5">
      <h1 className="mb-2 font-serif text-[clamp(1.9rem,4vw,2.5rem)] leading-[1.1] font-normal tracking-[-0.02em] text-balance">
        Add the first job you are looking at.
      </h1>

      <FormField id="title" label="Job title *" error={errors.title}>
        <Input {...bind("title")} required maxLength={120} />
      </FormField>

      <FormField id="company" label="Company *" error={errors.company}>
        <Input {...bind("company")} required maxLength={120} />
      </FormField>

      <FormField id="link" label={<>Link<OptionalTag /></>}>
        <Input {...bind("link")} type="url" placeholder="https://" />
      </FormField>

      <FormField id="stage" label="Stage">
        {/* No shared Select yet, so this reuses the .field style from index.css */}
        <select id="stage" name="stage" value={values.stage} onChange={(e) => setValue("stage", e.target.value)} className="field min-h-12 w-full">
          <option value="wishlist">Wishlist</option>
          <option value="applied">Applied</option>
        </select>
      </FormField>

      <div className="mt-2 grid gap-2.5">
        <Button type="submit" variant="primary" fullWidth>
          Add job and finish
        </Button>
        <Button type="button" fullWidth onClick={onSkip}>
          I will add one later
        </Button>
      </div>

      {/* TextLink is a router <Link>, so "Back" (an action, not a route) uses a button with the same look */}
      <button
        type="button"
        onClick={onBack}
        className="w-fit cursor-pointer text-sm underline decoration-1 underline-offset-[3px] hover:decoration-2"
      >
        Back
      </button>
    </form>
  );
}