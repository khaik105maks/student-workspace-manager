"use client";
import { useRef, useState } from "react";
import { z } from "zod";

export function RenewInvite(props: RenewInviteProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [failure, setFailure] = useState("");
  async function send() {
    setIsBusy(true); setFailure("");
    try { const status = await renew(props.courseId, props.email); props.onSuccess(status); dialog.current?.close(); }
    catch { setFailure("Не вдалося завершити запрошення. Старе могло бути видалене. Закрийте вікно й натисніть Sync, щоб перевірити стан."); }
    finally { setIsBusy(false); }
  }
  const label = props.isPending ? "Повторити" : "Запросити";
  return <>
    <button className="invite-action" disabled={props.disabled} onClick={() => { setFailure(""); dialog.current?.showModal(); }} aria-label={`${label} запрошення для ${props.email}`} type="button">{label}<span aria-hidden="true">↗</span></button>
    <dialog ref={dialog} className="invite-dialog" aria-label="Підтвердження запрошення" onCancel={(event) => { if (isBusy) event.preventDefault(); }}>
      <div className="invite-dialog-content">
        <p className="eyebrow">CLASSROOM</p><h2>{invitationTitle(props.isPending)}</h2>
        <p className="invite-recipient">{props.email}</p>
        <p>Створимо запрошення до поточного курсу. Якщо запрошення вже існує, замінимо його новим.</p>
        <p className="text-xs text-zinc-500">Повторна доставка листа залежить від Google.</p>
        {failure && <p role="alert" className="invite-error">{failure}</p>}
        <div className="invite-dialog-actions"><button autoFocus disabled={isBusy} onClick={() => dialog.current?.close()} type="button">Скасувати</button><button className="invite-confirm" disabled={isBusy || Boolean(failure)} onClick={send} type="button">{isBusy ? "Надсилаємо…" : "Підтвердити запрошення"}</button></div>
      </div>
    </dialog>
  </>;
}

async function renew(courseId: string, email: string): Promise<"invited" | "already-member"> {
  const response = await fetch("/api/classroom/invite/renew", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ courseId, email, isHumanConfirmed: true }) });
  if (!response.ok) throw new Error("Invitation failed");
  const payload: unknown = await response.json();
  const { status } = z.object({ status: z.enum(["invited", "already-member", "failed"]) }).parse(payload);
  if (status === "failed") throw new Error("Invitation creation failed");
  return status;
}

interface RenewInviteProps {
  readonly courseId: string;
  readonly email: string;
  readonly isPending: boolean;
  readonly disabled: boolean;
  readonly onSuccess: (status: "invited" | "already-member") => void;
}

function invitationTitle(isPending: boolean) { return isPending ? "Повторити запрошення?" : "Запросити студента?"; }
