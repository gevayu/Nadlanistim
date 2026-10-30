// Stands where a collaboration's publisher would be for a visitor without a membership. The real name is
// never sent to them; this is a fixed placeholder, blurred so it reads as "there is a name here".
export default function HiddenName() {
  return (
    <span className="co-hidden-name" role="img" aria-label="שם המפרסם גלוי לחברי המועדון בלבד">
      <span aria-hidden>ישראל ישראלי · יזם נדל״ן</span>
    </span>
  );
}
