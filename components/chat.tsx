"use client";

// Must stay the first import: it configures zod before the AI SDK builds its schemas.
import "@/lib/zod-jitless";
import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { Square, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import Markdown from "react-markdown";

import { Header } from "@/components/header";
import { LogoutButton } from "@/components/logout-button";
import type { Level } from "@/lib/profile";
import { cn } from "@/lib/utils";

type Message = UIMessage<{ at: number }>;

// Red-pen margin mark (س١ / ج).
const mark = "font-pen text-[1.375rem] leading-rule text-pen";
const row = "grid grid-cols-[var(--margin)_minmax(0,1fr)]";
const body = "ps-5 pe-5 sm:pe-8";

const textOf = (m: Message) => m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");

/** The signature mark: a red tick that strokes itself in when an answer completes. */
function Tick({ label }: { label: string }) {
  return (
    <svg viewBox="0 0 24 24" role="img" aria-label={label} className="tick my-1.5 size-5 text-pen">
      <path d="M4 12.5l5 5L20 6.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Chat({ university, major, level }: { university: string; major: string; level: Level | null }) {
  const t = useTranslations("chat");
  const lv = useTranslations("levels");
  const locale = useLocale();
  const { messages, sendMessage, status, stop, error, regenerate } = useChat<Message>();
  const [text, setText] = useState("");
  const busy = useRef(false);
  const stopped = useRef(new Set<string>());
  const latest = useRef<Message[]>([]);
  const input = useRef<HTMLTextAreaElement>(null);
  const end = useRef<HTMLDivElement>(null);

  const streaming = status === "submitted" || status === "streaming";
  // Arabic pages use Arabic-Indic digits throughout, matching the list markers.
  const tag = locale === "ar" ? "ar-u-nu-arab" : locale;
  const num = useMemo(() => new Intl.NumberFormat(tag), [tag]);
  const clock = useMemo(() => new Intl.DateTimeFormat(tag, { hour: "numeric", minute: "2-digit" }), [tag]);
  const today = useMemo(
    () => new Intl.DateTimeFormat(tag, { day: "numeric", month: "long", year: "numeric" }).format(new Date()),
    [tag],
  );

  useEffect(() => {
    latest.current = messages;
  });

  // Re-arm the composer once a turn finishes; hand focus back on devices with a keyboard.
  useEffect(() => {
    if (status === "ready" || status === "error") busy.current = false;
    if (status === "ready" && matchMedia("(pointer: fine)").matches) input.current?.focus();
  }, [status]);

  useEffect(() => {
    if (messages.length) end.current?.scrollIntoView({ block: "end" });
  }, [messages, status]);

  const halt = () => {
    const last = latest.current.at(-1);
    // Stopped before any text arrived, the last message is still the question: mark that instead.
    if (last) stopped.current.add(last.id);
    void stop();
  };

  // Esc stops the writing, wherever focus is.
  useEffect(() => {
    if (!streaming) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") halt();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- halt reads refs only
  }, [streaming]);

  const send = (value: string) => {
    const trimmed = value.trim();
    // The ref blocks a double-submit in the same tick, before status updates.
    if (!trimmed || busy.current) return;
    busy.current = true;
    setText("");
    void sendMessage({ text: trimmed, metadata: { at: Date.now() } });
  };

  const questions = messages.filter((m) => m.role === "user").length;
  const unavailable = error?.message.includes("assistant_unavailable");
  const lastRole = messages.at(-1)?.role;
  const suggestions = (["one", "two", "three"] as const).map((k) => ({
    ordinal: t(`ordinal.${k}`),
    text: t(`suggestions.${level ?? "default"}.${k}`, { major }),
  }));

  const stopMark = (
    <button
      type="button"
      onClick={halt}
      className="inline-flex h-rule items-center gap-1 text-xs font-medium text-pen underline-offset-2 hover:underline"
    >
      <Square aria-hidden className="size-2.5 fill-current" />
      {t("stop")}
    </button>
  );

  let q = 0;
  const entries = messages.map((m, i) => {
    const content = textOf(m);
    if (m.role === "user") {
      q += 1;
      const unanswered = stopped.current.has(m.id) && messages[i + 1]?.role !== "assistant" && !(i === messages.length - 1 && streaming);
      return (
        <Fragment key={m.id}>
        <li className={cn(row, i > 0 && "mt-rule")}>
          {/* Margin furniture: the number, then the time on its own rule. */}
          <div className="grid content-start justify-items-center">
            <span aria-hidden className={mark}>
              {t("q", { n: num.format(q) })}
            </span>
            {m.metadata?.at != null && (
              <time className="whitespace-nowrap text-xs leading-rule tabular-nums text-pen">{clock.format(m.metadata.at)}</time>
            )}
          </div>
          <p dir="auto" className={cn(body, "whitespace-pre-wrap break-words text-[1.0625rem] font-medium leading-rule text-ballpoint")}>
            <span className="sr-only">{t("you")}: </span>
            {content}
          </p>
        </li>
        {unanswered && (
          <li className={row}>
            <div className="grid content-start justify-items-center">
              <span aria-hidden className={mark}>
                {t("a")}
              </span>
              <span className="text-xs leading-rule text-pen">{t("stopped")}</span>
            </div>
            <span />
          </li>
        )}
        </Fragment>
      );
    }
    const isLast = i === messages.length - 1;
    const writing = isLast && streaming;
    const failed = isLast && !!error;
    return (
      <li key={m.id} className={row}>
        <div className="grid content-start justify-items-center">
          <span aria-hidden className={mark}>
            {t("a")}
          </span>
          {writing ? (
            stopMark
          ) : failed ? null : stopped.current.has(m.id) ? (
            <span className="text-xs leading-rule text-pen">{t("stopped")}</span>
          ) : (
            <Tick label={t("done")} />
          )}
        </div>
        <article
          aria-label={t("assistant")}
          aria-busy={writing}
          className={cn(body, "answer break-words font-read text-[1.125rem] leading-rule text-print")}
        >
          <Markdown
            // Model output never loads remote images (a prompt-injected URL could exfiltrate the page).
            disallowedElements={["img"]}
            components={{
              a: ({ href, children }) => (
                <a href={href} target="_blank" rel="noopener noreferrer">
                  {children}
                </a>
              ),
            }}
          >
            {content}
          </Markdown>
        </article>
      </li>
    );
  });

  return (
    <div className="flex h-dvh flex-col bg-cover">
      <Header>
        <LogoutButton />
      </Header>

      <main className="sheet mx-auto flex min-h-0 w-full max-w-[50rem] flex-1 flex-col bg-paper text-print shadow-sheet">
        {/* The booklet's printed header form, already filled in. */}
        {/* gap-px over spot ink draws the cell rules at any width; phones drop the date to keep two rows. */}
        <dl className="grid shrink-0 grid-cols-2 gap-px border-b-2 border-print bg-spot/40 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1.2fr)_minmax(0,0.9fr)_minmax(0,1fr)_auto]">
          {[
            [t("university"), university],
            [t("major"), major],
            [t("level"), level ? lv(`short.${level}`) : "—"],
            [t("date"), <time key="d" suppressHydrationWarning>{today}</time>, "max-sm:hidden"],
            [t("questions"), num.format(questions)],
          ].map(([label, value, extra]) => (
            <div key={String(label)} className={cn("min-w-0 bg-paper px-4 py-2", extra as string | undefined)}>
              <dt className="text-[0.6875rem] font-medium text-spot">{label}</dt>
              <dd dir="auto" className="text-balance break-words text-[0.9375rem] font-semibold tabular-nums">
                {value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="relative flex min-h-0 flex-1 flex-col">
          {/* Double red margin rule; it flips sides with the script and never collapses. */}
          <div aria-hidden className="pointer-events-none absolute inset-y-0 start-margin z-10 w-[5px] border-x border-pen/60" />

          <div className="ruled min-h-0 flex-1 overflow-y-auto py-rule">
            {messages.length === 0 ? (
              <section aria-labelledby="booklet-title" className={row}>
                <span />
                <div className={body}>
                  <h1 id="booklet-title" className="text-balance text-[1.875rem] font-semibold leading-rule-2 sm:text-[2.25rem]">
                    {t("emptyTitle")}
                  </h1>
                  <p className="leading-rule text-spot">{t("emptyBody", { university, major })}</p>

                  <h2 className="mt-rule font-semibold leading-rule">{t("suggestionsTitle")}</h2>
                  <ol>
                    {suggestions.map((s) => (
                      <li key={s.ordinal}>
                        <button
                          type="button"
                          onClick={() => send(s.text)}
                          className="group grid w-full gap-x-3 text-start leading-rule sm:grid-cols-[7.5rem_1fr]"
                        >
                          <span className="text-sm text-spot">{s.ordinal}</span>
                          <span className="text-print underline-offset-4 group-hover:text-ballpoint group-hover:underline">{s.text}</span>
                        </button>
                      </li>
                    ))}
                  </ol>

                  <section className="mt-rule bg-paper px-4 outline outline-1 -outline-offset-1 outline-print/60">
                    <h2 className="text-sm font-semibold leading-rule">{t("instructionsTitle")}</h2>
                    <ol className="list-decimal ps-5 text-sm leading-rule rtl:list-[arabic-indic]">
                      <li>{t("instructions.one")}</li>
                      <li>{t("instructions.two")}</li>
                      <li>{t("instructions.three")}</li>
                    </ol>
                  </section>
                </div>
              </section>
            ) : (
              <ol aria-label={t("questions")}>
                {entries}
                {status === "submitted" && lastRole === "user" && (
                  <li className={row}>
                    <div className="grid content-start justify-items-center">
                      <span aria-hidden className={mark}>
                        {t("a")}
                      </span>
                      {stopMark}
                    </div>
                    <p className={cn(body, "leading-rule")}>
                      <span aria-hidden className="pen-caret" />
                      <span className="sr-only">{t("writing")}</span>
                    </p>
                  </li>
                )}
                {error && (
                  <li className={cn(row, lastRole === "assistant" && "mt-rule")}>
                    <div className="grid content-start justify-items-center">
                      {lastRole === "user" && (
                        <span aria-hidden className={mark}>
                          {t("a")}
                        </span>
                      )}
                      <X aria-hidden strokeWidth={2.5} className="my-1.5 size-5 text-pen" />
                    </div>
                    <div role="alert" className={cn(body, "leading-rule text-pen")}>
                      <p>{unavailable ? t("unavailable") : t("error")}</p>
                      <button
                        type="button"
                        onClick={() => void regenerate()}
                        className="font-medium text-ballpoint underline underline-offset-4 hover:no-underline"
                      >
                        {t("retry")}
                      </button>
                    </div>
                  </li>
                )}
              </ol>
            )}
            <div ref={end} />
            {/* Announce the turn, not every streamed token. */}
            <p role="status" className="sr-only">
              {streaming ? t("writing") : lastRole === "assistant" && !error ? t("done") : ""}
            </p>
          </div>

          {/* The composer is the next ruled line of the booklet. */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(text);
            }}
            className="ruled grid shrink-0 grid-cols-[var(--margin)_minmax(0,1fr)_auto] items-start pb-2"
          >
            <label htmlFor="message" className={cn(mark, "text-center")}>
              <span aria-hidden>{t("q", { n: num.format(questions + 1) })}</span>
              <span className="sr-only">{t("inputLabel")}</span>
            </label>
            <textarea
              ref={input}
              id="message"
              rows={1}
              dir="auto"
              value={text}
              placeholder={t("placeholder")}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  send(text);
                }
              }}
              className="max-h-[calc(var(--rule)*6)] min-h-rule resize-none bg-transparent ps-5 pe-3 text-[1.0625rem] font-medium leading-rule text-ballpoint outline-none [field-sizing:content] placeholder:font-normal placeholder:text-spot focus-visible:shadow-[0_2px_0_hsl(var(--ballpoint))]"
            />
            <button type="submit" disabled={!text.trim() || streaming} className="stamp me-3 sm:me-5">
              {t("send")}
            </button>
            <p className="col-span-2 col-start-2 hidden ps-5 text-xs leading-rule text-spot sm:block">
              {t.rich("hint", { kbd: (chunks) => <kbd dir="ltr">{chunks}</kbd> })}
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
