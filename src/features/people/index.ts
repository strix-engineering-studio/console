export { default as PeoplePage } from "./pages/PeoplePage";
export { default as PersonCreatePage } from "./pages/PersonCreatePage";
export { default as PersonDetailsPage } from "./pages/PersonDetailsPage";
export { default as PersonEditPage } from "./pages/PersonEditPage";
export { personSchema } from "./schemas";
export type { Person } from "./types";
export { usePeople, usePerson, useCreatePerson, useUpdatePerson } from "./services/people.queries";
