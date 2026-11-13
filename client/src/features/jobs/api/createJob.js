// TODO: replace with POST /jobs through lib/api.js.
// Expected responses:
//   201 -> { job }
//   409 -> { duplicate: { id, title, company } }   (skipped when confirmDuplicate is true)
//   422 -> { errors: { field_name: "message" } }
export default async function createJob(values, { confirmDuplicate = false } = {}) {
  await new Promise((resolve) => setTimeout(resolve, 600));
  console.info("create job", values, { confirmDuplicate });
  return { job: { id: crypto.randomUUID(), ...values } };
}