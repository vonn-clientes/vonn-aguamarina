import { redirect } from "next/navigation";

// Esta pantalla se unificó: los horarios están en "Textos y datos" y los turnos en la Agenda.
export default function Page() {
  redirect("/panel/agenda");
}
