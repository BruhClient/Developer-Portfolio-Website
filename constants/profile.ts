/*
  Who the site is about.

  A third copy of the name was about to appear in the welcome screen, alongside
  the ones in app/layout.tsx's metadata, so it lives here now. The metadata
  still carries its own literals - changing them changes what search engines and
  link previews show, which is not a change the welcome screen should make on
  its way past.
*/
export const PROFILE = {
  name: "Travis Ang",
  /** How the room introduces itself. A welcome mat is not a business card. */
  firstName: "Travis",
  role: "Data Science & AI at NTU",
  /*
    The same two facts spelled out, for the structured data a search engine
    reads. The room abbreviates because it is greeting someone; a machine
    matching "Nanyang Technological University" cannot expand "NTU" for itself,
    and neither can a recruiter's search.
  */
  jobTitle: "Data Science and Artificial Intelligence Undergraduate",
  university: "Nanyang Technological University",
} as const;
