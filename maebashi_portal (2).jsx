import { useState, useEffect } from "react";

const INTERNS = ["鈴木さん", "磯部さん", "橋本さん", "佐野さん", "テスト"];
const HOURLY = 1500;

const BRAND = "#C8831F";
const BRAND_DIM = "#C8831F22";
const BRAND_FAINT = "#C8831F10";

const INTERN_COLORS = {
  "鈴木さん": "#C8831F",
  "磯部さん": "#2563A8",
  "橋本さん": "#2D6A4F",
  "佐野さん": "#8B3A6F",
  "テスト":   "#888780",
};

const STEPS = [
  { num: 1, title: "インタビュー候補者のリサーチ", time: "1h", content: ["InstagramやXで「前橋」「群馬」などのキーワードで検索する", "地域のフリーペーパー・ウェブメディアをチェックする", "候補者名・活動内容・連絡先をスプレッドシートに記録する", "毎月3〜5名をリストアップし、担当者に確認してからDMを送る"], tip: "「面白い人」は身近にもいます。友人・知人の紹介も大歓迎です。" },
  { num: 2, title: "候補者へのDM送付", time: "1h", content: ["DMは丁寧かつ簡潔に。Podcastの趣旨・所要時間・場所（ガレア前橋）を明記する", "返信があった場合は速やかに（24時間以内を目安に）返信する", "候補者の都合を優先しつつ、スケジュールに合う日程を提案する"], tip: "DM文のテンプレートは担当者から共有してもらいましょう。" },
  { num: 3, title: "インタビュー準備", time: "2h", content: ["出演者のSNS・活動内容を調べ、背景を理解する", "質問リスト（10〜15問）を作成する。「人となり」「活動の動機」「前橋への思い」などを軸に", "質問リストは事前に担当者に共有し、フィードバックをもらう", "収録当日の持ち物・確認事項をリストアップする（録音機器・充電など）"], tip: "質問は「はい/いいえ」で終わらないオープン質問にすると話が広がります。" },
  { num: 4, title: "インタビュー実施", time: "3h", content: ["開始15分前に会場入りし、録音環境・機材を確認する", "インタビューは基本的に録音（スマートフォンまたは録音機器）", "会話の流れを大切に。質問リストに縛られすぎず、自然な対話を心がける", "終了後、SNSシェアの許可確認・タグ付け許可を得る", "収録後はすぐに音声ファイルをPCに保存・バックアップする"], tip: "緊張したら深呼吸。まず「最近どんなことをしていますか？」など軽い話から始めましょう。" },
  { num: 5, title: "音声編集", time: "3h", content: ["不要な間・言い間違い・ノイズをカットする", "音量を均一に調整する（BGMを入れる場合はレベルバランスに注意）", "冒頭にイントロ（番組名・ゲスト名の紹介）、末尾にアウトロを入れる", "書き出し形式はMP3（192kbps以上推奨）で保存する", "完成ファイルは担当者に共有し確認・フィードバックをもらってから公開する"], tip: "初めてFilmoraを使う場合は、YouTubeのチュートリアル動画を見てから始めると効率的です。" },
  { num: 6, title: "投稿内容の企画", time: "1h", content: ["各エピソードのタイトル・概要文（100〜200文字）を作成する", "ゲストの印象的な発言を「引用テキスト」としてピックアップする", "使用する画像（ゲストの写真など）を準備する（必ず使用許可を確認）"], tip: "「このエピソードを一言で表すなら？」を考えると、タイトルや引用が決まりやすいです。" },
  { num: 7, title: "SNS投稿", time: "1h", content: ["投稿プラットフォームは担当者の指示に従う（Instagram・X等）", "投稿文・画像・ハッシュタグを準備し、担当者に確認してから投稿する", "ゲストにもシェアをお願いし、リポストしてもらえるよう声をかける", "投稿後のコメント・反応には積極的に返信・いいねをする"], tip: null },
];

const WEEKS = [
  { label: "月初〜1週目", task: "リサーチ・DM送付",       steps: "STEP 1・2", color: "#C8831F" },
  { label: "1週目〜2週目", task: "インタビュー準備・日程調整", steps: "STEP 3",    color: "#2563A8" },
  { label: "2週目〜3週目", task: "インタビュー実施",        steps: "STEP 4",    color: "#2D6A4F" },
  { label: "3週目〜4週目", task: "音声編集・SNS準備",       steps: "STEP 5・6", color: "#8B3A6F" },
  { label: "月末",        task: "公開・SNS投稿・報告",      steps: "STEP 7",    color: "#4A3A8B" },
];

const BREAKDOWN = [
  { label: "リサーチ",      h: 1 }, { label: "DM送付",       h: 1 },
  { label: "インタビュー準備", h: 2 }, { label: "インタビュー実施", h: 3 },
  { label: "音声編集",      h: 3 }, { label: "投稿企画",      h: 1 },
  { label: "SNS投稿",      h: 1 }, { label: "MTG・相談",     h: 4 },
];

const STATUS = {
  todo:  { label: "未着手", color: "#888780" },
  doing: { label: "進行中", color: "#2563A8" },
  done:  { label: "完了",   color: "#2D6A4F" },
};

// ── helpers ──────────────────────────────────────────────────────────────────
function pad(n) { return String(n).padStart(2, "0"); }
function fmtElapsed(ms) {
  const s = Math.floor(ms / 1000);
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
}
function fmtTime(ts) { return new Date(ts).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }); }
function fmtDate(ts) { return new Date(ts).toLocaleDateString("ja-JP"); }
function calcWage(min) { return Math.round((min / 60) * HOURLY); }

// ── shared style tokens ───────────────────────────────────────────────────────
const card = { background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)" };
const cardSec = { background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)" };
const label = { fontSize: 10, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "var(--font-mono)", color: "var(--color-text-secondary)" };
const accentLine = { height: 3, borderRadius: 2, background: BRAND };

// ── MAG Logo ──────────────────────────────────────────────────────────────────
const MAG_LOGO = "data:image/jpeg;base64,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";

function MagLogo({ size = 72 }) {
  return (
    <img
      src={MAG_LOGO}
      alt="マエバシアンダーグラウンド"
      style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", display: "block", flexShrink: 0 }}
    />
  );
}

// ── Waveform decoration ───────────────────────────────────────────────────────
function Bars({ color = BRAND, opacity = 0.4, count = 28 }) {
  const hs = [4,9,6,14,8,18,11,7,16,10,5,13,9,15,6,11,5,15,8,10,4,16,9,13,6,14,8,11];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
      {hs.slice(0, count).map((h, i) => (
        <div key={i} style={{ width: 2, height: h, background: color, opacity, borderRadius: 1 }} />
      ))}
    </div>
  );
}

// ── UserSelect ────────────────────────────────────────────────────────────────
function UserSelect({ onSelect }) {
  return (
    <div style={{ fontFamily: "var(--font-sans)", maxWidth: 480, margin: "0 auto" }}>
      {/* Hero */}
      <div style={{ padding: "28px 22px 22px", borderBottom: `1px solid var(--color-border-tertiary)` }}>
        {/* amber top bar */}
        <div style={{ ...accentLine, width: 40, marginBottom: 18 }} />

        {/* Logo + title row */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 18 }}>
          <MagLogo size={88} />
          <div style={{ flex: 1 }}>
            <div style={{ ...label, marginBottom: 8 }}>Intern Portal</div>
            <h1 style={{ fontSize: 24, fontWeight: 500, margin: "0 0 6px", lineHeight: 1.1, letterSpacing: "-0.02em", color: "var(--color-text-primary)" }}>
              インターン<br />管理ポータル
            </h1>
            <div style={{ marginTop: 12 }}>
              <Bars count={20} />
            </div>
          </div>
        </div>

        <p style={{ margin: "14px 0 0", fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.75 }}>
          前橋・群馬を拠点に活躍する人々の声を掘り起こし、音声コンテンツとして届けるポッドキャスト。「知られざる前橋」を一緒に発信していきましょう。
        </p>
      </div>

      {/* User list */}
      <div style={{ padding: "18px 22px" }}>
        <div style={{ ...label, marginBottom: 12 }}>ユーザーを選択</div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          {INTERNS.map(intern => {
            const c = INTERN_COLORS[intern];
            const isTest = intern === "テスト";
            return (
              <button key={intern} onClick={() => onSelect(intern)} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 16px", ...card, borderLeft: `3px solid ${c}`, cursor: "pointer", textAlign: "left", fontFamily: "var(--font-sans)", transition: "opacity 0.15s" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: c + "18", color: c, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 500, flexShrink: 0, fontFamily: "var(--font-mono)" }}>{intern[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "var(--color-text-primary)" }}>{intern}</div>
                  <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 1 }}>{isTest ? "検証・テスト用アカウント" : "インターン生"}</div>
                </div>
                <div style={{ fontSize: 16, color: "var(--color-text-secondary)", opacity: 0.4 }}>›</div>
              </button>
            );
          })}
        </div>

        <div style={{ borderTop: "0.5px solid var(--color-border-tertiary)", paddingTop: 14 }}>
          <button onClick={() => onSelect("マネージャー")} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 16px", width: "100%", ...cardSec, borderLeft: "3px solid var(--color-border-secondary)", cursor: "pointer", textAlign: "left", fontFamily: "var(--font-sans)" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--color-background-tertiary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 500, color: "var(--color-text-secondary)", flexShrink: 0, fontFamily: "var(--font-mono)" }}>M</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: "var(--color-text-primary)" }}>マネージャー</div>
              <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 1 }}>全ボードを閲覧・メモ追記できます</div>
            </div>
            <div style={{ fontSize: 16, color: "var(--color-text-secondary)", opacity: 0.4 }}>›</div>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Header ────────────────────────────────────────────────────────────────────
function Header({ user, onLogout }) {
  const c = INTERN_COLORS[user] || "var(--color-text-secondary)";
  return (
    <div style={{ borderBottom: `1px solid var(--color-border-tertiary)` }}>
      {/* amber top strip */}
      <div style={{ height: 2, background: `linear-gradient(90deg, ${BRAND} 0%, ${BRAND}00 100%)` }} />
      <div style={{ padding: "8px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <MagLogo size={34} />
          <div style={{ width: 1, height: 26, background: "var(--color-border-tertiary)", margin: "0 2px" }} />
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: c + "18", color: c, border: `1.5px solid ${c}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 500, fontFamily: "var(--font-mono)" }}>
            {user === "マネージャー" ? "M" : user[0]}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>{user}</div>
            <div style={{ ...label, fontSize: 9, letterSpacing: "0.08em" }}>Maebashi Underground</div>
          </div>
        </div>
        <button onClick={onLogout} style={{ fontSize: 11, color: "var(--color-text-secondary)", background: "none", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-md)", padding: "4px 10px", cursor: "pointer", fontFamily: "var(--font-sans)" }}>ログアウト</button>
      </div>
    </div>
  );
}

// ── Nav ───────────────────────────────────────────────────────────────────────
function Nav({ tab, setTab, isManager }) {
  const tabs = [
    { id: "manual",    label: "マニュアル" },
    { id: "milestone", label: "マイルストーン" },
    ...(!isManager ? [{ id: "clock", label: "打刻" }] : []),
    { id: "board",     label: "作業ボード" },
  ];
  return (
    <div style={{ display: "flex", borderBottom: "0.5px solid var(--color-border-tertiary)", padding: "0 16px", overflowX: "auto", background: "var(--color-background-secondary)" }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => setTab(t.id)} style={{
          padding: "11px 14px", fontSize: 12, fontFamily: "var(--font-sans)",
          color: tab === t.id ? BRAND : "var(--color-text-secondary)",
          background: "none", border: "none",
          borderBottom: tab === t.id ? `2px solid ${BRAND}` : "2px solid transparent",
          cursor: "pointer", whiteSpace: "nowrap",
          fontWeight: tab === t.id ? 500 : 400, marginBottom: -1,
        }}>{t.label}</button>
      ))}
    </div>
  );
}

// ── MeetingModal ──────────────────────────────────────────────────────────────
function MeetingModal({ user, onClose }) {
  const [sent, setSent] = useState(false);
  const [msg, setMsg] = useState(`${user}です。\nミーティングをお願いしたいのですが、ご都合のよい日時はありますか？\n\n相談内容：\n`);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }}>
      <div style={{ ...card, width: "100%", maxWidth: 380, padding: 22 }}>
        {sent ? (
          <div style={{ textAlign: "center", padding: "12px 0" }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#2D6A4F18", border: "1px solid #2D6A4F40", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke="#2D6A4F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>送信しました</div>
            <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>マネージャーに依頼が届きました</div>
            <button onClick={onClose} style={{ marginTop: 16, padding: "8px 24px", background: BRAND, color: "white", border: "none", borderRadius: "var(--border-radius-md)", cursor: "pointer", fontSize: 13, fontFamily: "var(--font-sans)" }}>閉じる</button>
          </div>
        ) : (
          <>
            <div style={{ ...accentLine, width: 24, marginBottom: 14 }} />
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 3 }}>ミーティングを依頼する</div>
            <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 14 }}>内容を確認・編集して送信してください</div>
            <textarea value={msg} onChange={e => setMsg(e.target.value)} rows={6} style={{ width: "100%", fontSize: 13, fontFamily: "var(--font-sans)", resize: "vertical", boxSizing: "border-box" }} />
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button onClick={onClose} style={{ flex: 1, padding: "9px", background: "none", border: "0.5px solid var(--color-border-secondary)", borderRadius: "var(--border-radius-md)", cursor: "pointer", fontSize: 13, fontFamily: "var(--font-sans)", color: "var(--color-text-secondary)" }}>キャンセル</button>
              <button onClick={() => setSent(true)} style={{ flex: 1, padding: "9px", background: BRAND, color: "white", border: "none", borderRadius: "var(--border-radius-md)", cursor: "pointer", fontSize: 13, fontWeight: 500, fontFamily: "var(--font-sans)" }}>送信する</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── ManualTab ─────────────────────────────────────────────────────────────────
function ManualTab({ totalMin, isManager, onMeeting }) {
  const [open, setOpen] = useState(null);
  const totalHours = (totalMin / 60).toFixed(1);
  const totalWage  = calcWage(totalMin);

  return (
    <div style={{ padding: "18px 16px" }}>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        <div style={{ ...cardSec, padding: "14px 16px" }}>
          <div style={{ ...label, marginBottom: 6 }}>今月の稼働時間</div>
          <div style={{ fontSize: 24, fontWeight: 500, fontFamily: "var(--font-mono)", color: "var(--color-text-primary)" }}>{totalHours}<span style={{ fontSize: 12, color: "var(--color-text-secondary)", fontFamily: "var(--font-sans)", marginLeft: 3 }}>h</span></div>
          <div style={{ fontSize: 10, color: "var(--color-text-secondary)", marginTop: 3 }}>打刻データより</div>
        </div>
        <div style={{ padding: "14px 16px", borderRadius: "var(--border-radius-lg)", background: BRAND_FAINT, border: `0.5px solid ${BRAND}30` }}>
          <div style={{ ...label, marginBottom: 6, color: BRAND }}>現在の給与（概算）</div>
          <div style={{ fontSize: 24, fontWeight: 500, fontFamily: "var(--font-mono)", color: BRAND }}>¥{totalWage.toLocaleString()}</div>
          <div style={{ fontSize: 10, color: BRAND, opacity: 0.7, marginTop: 3, fontFamily: "var(--font-mono)" }}>¥{HOURLY.toLocaleString()} × {totalHours}h</div>
        </div>
      </div>

      {/* Meeting button (intern only) */}
      {!isManager && (
        <button onClick={onMeeting} style={{ width: "100%", marginBottom: 18, padding: "13px 16px", ...card, borderLeft: `3px solid #2563A8`, cursor: "pointer", fontFamily: "var(--font-sans)", display: "flex", alignItems: "center", gap: 12, textAlign: "left" }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#2563A818", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="16" rx="2" stroke="#2563A8" strokeWidth="1.5"/><path d="M8 2v3M16 2v3M3 9h18" stroke="#2563A8" strokeWidth="1.5" strokeLinecap="round"/><circle cx="12" cy="15" r="2" fill="#2563A8"/></svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>マネージャーにミーティングを依頼</div>
            <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 1 }}>相談・進捗確認・振り返りなど</div>
          </div>
          <div style={{ fontSize: 16, opacity: 0.4 }}>›</div>
        </button>
      )}

      {/* Steps */}
      <div style={{ ...label, marginBottom: 12 }}>業務フロー — 全7ステップ</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {STEPS.map(step => (
          <div key={step.num} style={{ ...card, overflow: "hidden", borderLeft: open === step.num ? `3px solid ${BRAND}` : "3px solid transparent", transition: "border-color 0.2s" }}>
            <button onClick={() => setOpen(open === step.num ? null : step.num)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", background: "none", border: "none", cursor: "pointer", textAlign: "left", fontFamily: "var(--font-sans)" }}>
              {/* large step number */}
              <div style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0, background: open === step.num ? BRAND : BRAND_DIM, color: open === step.num ? "white" : BRAND, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 500, fontFamily: "var(--font-mono)", transition: "background 0.2s, color 0.2s" }}>{step.num}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>{step.title}</div>
                <div style={{ fontSize: 10, color: "var(--color-text-secondary)", marginTop: 2, fontFamily: "var(--font-mono)" }}>目安: {step.time}</div>
              </div>
              <div style={{ fontSize: 12, color: "var(--color-text-secondary)", transform: open === step.num ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }}>▾</div>
            </button>
            {open === step.num && (
              <div style={{ padding: "0 16px 16px", borderTop: "0.5px solid var(--color-border-tertiary)" }}>
                <ul style={{ margin: "12px 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                  {step.content.map((item, i) => (
                    <li key={i} style={{ display: "flex", gap: 10, fontSize: 13, color: "var(--color-text-primary)", lineHeight: 1.65 }}>
                      <span style={{ color: BRAND, flexShrink: 0, fontFamily: "var(--font-mono)", marginTop: 1 }}>›</span>{item}
                    </li>
                  ))}
                </ul>
                {step.tip && (
                  <div style={{ marginTop: 12, padding: "10px 13px", background: BRAND_FAINT, borderRadius: "var(--border-radius-md)", borderLeft: `3px solid ${BRAND}`, fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.7 }}>
                    💡 {step.tip}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Payroll info */}
      <div style={{ marginTop: 16, ...cardSec, padding: "14px 16px", borderLeft: "3px solid var(--color-border-secondary)" }}>
        <div style={{ ...label, marginBottom: 8 }}>給与・交通費</div>
        {["勤務時間は月末にまとめて報告。担当者指定のフォーマットで提出", "交通費はインタビュー来場時のみ対象。領収書またはICカード明細を保存", "給与・交通費は翌月20日に支払い"].map((t, i) => (
          <div key={i} style={{ display: "flex", gap: 8, fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.75 }}>
            <span style={{ flexShrink: 0, color: BRAND, fontFamily: "var(--font-mono)" }}>—</span>{t}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── MilestoneTab ──────────────────────────────────────────────────────────────
function MilestoneTab() {
  return (
    <div style={{ padding: "18px 16px" }}>
      <div style={{ ...label, marginBottom: 16 }}>月次スケジュール</div>

      <div style={{ position: "relative", paddingLeft: 40, marginBottom: 26 }}>
        <div style={{ position: "absolute", left: 12, top: 18, bottom: 18, width: 1, background: "var(--color-border-tertiary)" }} />
        {WEEKS.map((w, i) => (
          <div key={i} style={{ position: "relative", marginBottom: i < WEEKS.length - 1 ? 12 : 0 }}>
            <div style={{ position: "absolute", left: -40, width: 14, height: 14, borderRadius: "50%", background: w.color, top: 13, border: "2.5px solid var(--color-background-primary)", zIndex: 1 }} />
            <div style={{ ...card, padding: "11px 14px", borderLeft: `3px solid ${w.color}` }}>
              <div style={{ ...label, fontSize: 9, marginBottom: 3 }}>{w.label}</div>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 3 }}>{w.task}</div>
              <div style={{ fontSize: 11, color: w.color, fontWeight: 500, fontFamily: "var(--font-mono)" }}>{w.steps}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ ...label, marginBottom: 12 }}>業務時間内訳（予想される時間）</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {BREAKDOWN.map(item => (
          <div key={item.label} style={{ ...cardSec, padding: "11px 13px" }}>
            <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 4 }}>{item.label}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
              <span style={{ fontSize: 20, fontWeight: 500, fontFamily: "var(--font-mono)" }}>{item.h}</span>
              <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>h</span>
            </div>
            <div style={{ marginTop: 7, height: 3, background: "var(--color-border-tertiary)", borderRadius: 2 }}>
              <div style={{ height: "100%", width: `${(item.h / 16) * 100}%`, background: BRAND, borderRadius: 2 }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 14, padding: "14px 16px", background: BRAND_FAINT, borderRadius: "var(--border-radius-lg)", borderLeft: `3px solid ${BRAND}` }}>
        <div style={{ ...label, color: BRAND, marginBottom: 5 }}>目標</div>
        <div style={{ fontSize: 13, lineHeight: 1.65 }}>月1回のエピソード公開を実現する</div>
        <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 5 }}>期間：3ヶ月（終了後は双方合意のうえ継続を検討）</div>
      </div>
    </div>
  );
}

// ── ClockTab ──────────────────────────────────────────────────────────────────
function ClockTab({ clockIn, now, records, onClockIn, onClockOut }) {
  const totalMin  = records.reduce((s, r) => s + (r.durationMin || 0), 0);
  const elapsedMs = clockIn ? now - clockIn : 0;
  const curWage   = calcWage(Math.floor(elapsedMs / 60000));

  return (
    <div style={{ padding: "18px 16px" }}>
      {/* Clock card */}
      <div style={{ ...cardSec, padding: "28px 20px", marginBottom: 14, textAlign: "center", borderLeft: clockIn ? `3px solid #2D6A4F` : "3px solid var(--color-border-tertiary)" }}>
        {clockIn ? (
          <>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "#2D6A4F15", border: "0.5px solid #2D6A4F40", borderRadius: 20, padding: "4px 12px", marginBottom: 14 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#2D6A4F" }} />
              <span style={{ fontSize: 11, color: "#2D6A4F", fontWeight: 500, fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}>REC</span>
            </div>
            <div style={{ fontSize: 42, fontWeight: 500, fontFamily: "var(--font-mono)", color: "var(--color-text-primary)", letterSpacing: "0.04em", lineHeight: 1 }}>{fmtElapsed(elapsedMs)}</div>
            <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 8, fontFamily: "var(--font-mono)" }}>START {fmtTime(clockIn)}</div>
            <div style={{ fontSize: 14, color: BRAND, marginTop: 10, fontWeight: 500, fontFamily: "var(--font-mono)" }}>¥{curWage.toLocaleString()}</div>
            <button onClick={onClockOut} style={{ marginTop: 18, padding: "11px 40px", background: "#B02A2A", color: "white", border: "none", borderRadius: "var(--border-radius-md)", cursor: "pointer", fontSize: 14, fontWeight: 500, fontFamily: "var(--font-sans)", letterSpacing: "0.03em" }}>退勤する</button>
          </>
        ) : (
          <>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "var(--color-background-tertiary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 20, padding: "4px 12px", marginBottom: 14 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--color-text-secondary)", opacity: 0.4 }} />
              <span style={{ fontSize: 11, color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}>STANDBY</span>
            </div>
            <div style={{ fontSize: 42, fontWeight: 500, fontFamily: "var(--font-mono)", color: "var(--color-text-secondary)", letterSpacing: "0.04em", lineHeight: 1 }}>--:--:--</div>
            <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 8 }}>出勤ボタンを押して開始してください</div>
            <button onClick={onClockIn} style={{ marginTop: 18, padding: "11px 40px", background: "#2D6A4F", color: "white", border: "none", borderRadius: "var(--border-radius-md)", cursor: "pointer", fontSize: 14, fontWeight: 500, fontFamily: "var(--font-sans)", letterSpacing: "0.03em" }}>出勤する</button>
          </>
        )}
      </div>

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        <div style={{ ...cardSec, padding: "12px 14px" }}>
          <div style={{ ...label, marginBottom: 5 }}>今月の合計</div>
          <div style={{ fontSize: 22, fontWeight: 500, fontFamily: "var(--font-mono)" }}>{Math.floor(totalMin / 60)}<span style={{ fontSize: 12, fontFamily: "var(--font-sans)", color: "var(--color-text-secondary)", marginLeft: 2 }}>h</span> {totalMin % 60}<span style={{ fontSize: 12, fontFamily: "var(--font-sans)", color: "var(--color-text-secondary)", marginLeft: 2 }}>m</span></div>
        </div>
        <div style={{ padding: "12px 14px", borderRadius: "var(--border-radius-lg)", background: BRAND_FAINT, border: `0.5px solid ${BRAND}25` }}>
          <div style={{ ...label, marginBottom: 5, color: BRAND }}>今月の給与</div>
          <div style={{ fontSize: 22, fontWeight: 500, fontFamily: "var(--font-mono)", color: BRAND }}>¥{calcWage(totalMin).toLocaleString()}</div>
        </div>
      </div>

      {/* Records */}
      <div style={{ ...label, marginBottom: 10 }}>勤怠記録</div>
      {records.length === 0 ? (
        <div style={{ ...cardSec, fontSize: 12, color: "var(--color-text-secondary)", textAlign: "center", padding: "28px 0" }}>記録がありません</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {records.map(rec => (
            <div key={rec.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 14px", ...card }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{rec.date}</div>
                <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 2, fontFamily: "var(--font-mono)" }}>{rec.clockIn} — {rec.clockOut}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 13, fontWeight: 500, fontFamily: "var(--font-mono)" }}>{Math.floor(rec.durationMin / 60)}h {rec.durationMin % 60}m</div>
                <div style={{ fontSize: 11, color: BRAND, marginTop: 2, fontFamily: "var(--font-mono)" }}>¥{calcWage(rec.durationMin).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── BoardTab ──────────────────────────────────────────────────────────────────
function BoardTab({ user, isManager, boards, selectedBoard, setSelectedBoard, onAddTask, onUpdateTask, onDeleteTask }) {
  const [newTask, setNewTask] = useState("");
  const [expandedTask, setExpandedTask] = useState(null);
  const [editNotes, setEditNotes] = useState({});
  const [editContent, setEditContent] = useState({});

  const viewIntern = isManager ? (selectedBoard || INTERNS[0]) : user;
  const myBoard    = boards[viewIntern] || [];
  const color      = INTERN_COLORS[viewIntern] || BRAND;

  const handleAdd = () => {
    if (!newTask.trim()) return;
    onAddTask(viewIntern, newTask.trim());
    setNewTask("");
  };

  const byStatus = (s) => myBoard.filter(t => t.status === s);

  return (
    <div style={{ padding: "18px 16px" }}>
      {/* Manager: board selector */}
      {isManager && (
        <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
          {INTERNS.map(intern => {
            const ic     = INTERN_COLORS[intern];
            const active = (selectedBoard || INTERNS[0]) === intern;
            return (
              <button key={intern} onClick={() => setSelectedBoard(intern)} style={{ padding: "6px 13px", fontSize: 12, fontFamily: "var(--font-sans)", background: active ? ic + "18" : "var(--color-background-secondary)", color: active ? ic : "var(--color-text-secondary)", border: `0.5px solid ${active ? ic : "var(--color-border-tertiary)"}`, borderRadius: "var(--border-radius-md)", cursor: "pointer", fontWeight: active ? 500 : 400 }}>
                {intern}
              </button>
            );
          })}
        </div>
      )}

      {/* Board header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: color, flexShrink: 0 }} />
        <div style={{ fontSize: 14, fontWeight: 500, flex: 1 }}>{viewIntern}の作業ボード</div>
        <div style={{ ...label, fontSize: 9 }}>{myBoard.length} TASKS</div>
      </div>

      {/* Add task input (intern only) */}
      {!isManager && (
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <input type="text" value={newTask} onChange={e => setNewTask(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAdd()} placeholder="新しいタスクを追加…" style={{ flex: 1, fontSize: 13, fontFamily: "var(--font-sans)" }} />
          <button onClick={handleAdd} style={{ padding: "8px 16px", background: BRAND, color: "white", border: "none", borderRadius: "var(--border-radius-md)", cursor: "pointer", fontSize: 13, fontWeight: 500, fontFamily: "var(--font-sans)", flexShrink: 0 }}>追加</button>
        </div>
      )}

      {myBoard.length === 0 ? (
        <div style={{ ...cardSec, fontSize: 13, color: "var(--color-text-secondary)", textAlign: "center", padding: "40px 0" }}>
          {isManager ? "タスクがありません" : "上のフォームからタスクを追加してください"}
        </div>
      ) : (
        ["todo", "doing", "done"].map(status => {
          const tasks = byStatus(status);
          if (!tasks.length) return null;
          const st = STATUS[status];
          return (
            <div key={status} style={{ marginBottom: 18 }}>
              {/* Status heading */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: st.color }} />
                <span style={{ ...label, color: st.color, fontSize: 10 }}>{st.label}</span>
                <span style={{ ...label, fontSize: 9 }}>— {tasks.length}</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {tasks.map(task => {
                  const isExp = expandedTask === task.id;
                  return (
                    <div key={task.id} style={{ ...card, overflow: "hidden", borderLeft: `3px solid ${st.color}` }}>
                      {/* Header row */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 14px", cursor: "pointer" }} onClick={() => setExpandedTask(isExp ? null : task.id)}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, color: "var(--color-text-primary)", lineHeight: 1.45 }}>{task.text}</div>
                          <div style={{ ...label, fontSize: 9, marginTop: 4 }}>{task.createdAt}</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 7, flexShrink: 0 }}>
                          {isManager ? (
                            <span style={{ fontSize: 10, color: st.color, fontWeight: 500, background: st.color + "14", padding: "2px 8px", borderRadius: 20, fontFamily: "var(--font-mono)" }}>{st.label}</span>
                          ) : (
                            <select value={task.status} onClick={e => e.stopPropagation()} onChange={e => onUpdateTask(viewIntern, task.id, { status: e.target.value })} style={{ fontSize: 11, fontFamily: "var(--font-sans)", padding: "3px 6px", borderRadius: "var(--border-radius-md)", border: "0.5px solid var(--color-border-secondary)", background: "var(--color-background-secondary)", color: STATUS[task.status].color }}>
                              {Object.entries(STATUS).map(([v, s]) => <option key={v} value={v}>{s.label}</option>)}
                            </select>
                          )}
                          <div style={{ fontSize: 12, color: "var(--color-text-secondary)", transform: isExp ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</div>
                        </div>
                      </div>

                      {/* Expanded */}
                      {isExp && (
                        <div style={{ borderTop: "0.5px solid var(--color-border-tertiary)", padding: "14px 14px", display: "flex", flexDirection: "column", gap: 14 }}>
                          {/* Intern notes */}
                          <div>
                            <div style={{ ...label, marginBottom: 8 }}>作業メモ・詳細</div>
                            {!isManager ? (
                              editContent[task.id] !== undefined ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                                  <textarea value={editContent[task.id]} onChange={e => setEditContent(p => ({ ...p, [task.id]: e.target.value }))} placeholder="作業の詳細・進捗・メモを入力…" rows={3} style={{ width: "100%", fontSize: 12, fontFamily: "var(--font-sans)", resize: "vertical", boxSizing: "border-box" }} />
                                  <div style={{ display: "flex", gap: 7 }}>
                                    <button onClick={() => { onUpdateTask(viewIntern, task.id, { content: editContent[task.id] }); setEditContent(p => { const n={...p}; delete n[task.id]; return n; }); }} style={{ flex: 1, fontSize: 11, padding: "7px", background: BRAND, color: "white", border: "none", borderRadius: "var(--border-radius-md)", cursor: "pointer", fontFamily: "var(--font-sans)" }}>保存</button>
                                    <button onClick={() => setEditContent(p => { const n={...p}; delete n[task.id]; return n; })} style={{ flex: 1, fontSize: 11, padding: "7px", background: "none", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-md)", cursor: "pointer", fontFamily: "var(--font-sans)", color: "var(--color-text-secondary)" }}>キャンセル</button>
                                  </div>
                                </div>
                              ) : (
                                <div onClick={() => setEditContent(p => ({ ...p, [task.id]: task.content || "" }))} style={{ minHeight: 48, padding: "10px 12px", background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", border: "0.5px dashed var(--color-border-secondary)", cursor: "pointer", fontSize: 12, color: task.content ? "var(--color-text-primary)" : "var(--color-text-secondary)", lineHeight: 1.65 }}>
                                  {task.content || "クリックして作業内容を入力…"}
                                </div>
                              )
                            ) : (
                              <div style={{ minHeight: 40, padding: "10px 12px", background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", border: "0.5px solid var(--color-border-tertiary)", fontSize: 12, color: task.content ? "var(--color-text-primary)" : "var(--color-text-secondary)", lineHeight: 1.65 }}>
                                {task.content || "（未記入）"}
                              </div>
                            )}
                          </div>

                          {/* Manager note */}
                          <div>
                            <div style={{ ...label, marginBottom: 8, color: BRAND }}>マネージャーからのメモ</div>
                            {isManager ? (
                              editNotes[task.id] !== undefined ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                                  <textarea value={editNotes[task.id]} onChange={e => setEditNotes(p => ({ ...p, [task.id]: e.target.value }))} placeholder="アドバイス・修正点・コメントを入力…" rows={3} style={{ width: "100%", fontSize: 12, fontFamily: "var(--font-sans)", resize: "vertical", boxSizing: "border-box" }} />
                                  <div style={{ display: "flex", gap: 7 }}>
                                    <button onClick={() => { onUpdateTask(viewIntern, task.id, { note: editNotes[task.id] }); setEditNotes(p => { const n={...p}; delete n[task.id]; return n; }); }} style={{ flex: 1, fontSize: 11, padding: "7px", background: BRAND, color: "white", border: "none", borderRadius: "var(--border-radius-md)", cursor: "pointer", fontFamily: "var(--font-sans)" }}>保存</button>
                                    <button onClick={() => setEditNotes(p => { const n={...p}; delete n[task.id]; return n; })} style={{ flex: 1, fontSize: 11, padding: "7px", background: "none", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-md)", cursor: "pointer", fontFamily: "var(--font-sans)", color: "var(--color-text-secondary)" }}>キャンセル</button>
                                  </div>
                                </div>
                              ) : (
                                <div onClick={() => setEditNotes(p => ({ ...p, [task.id]: task.note || "" }))} style={{ minHeight: 40, padding: "10px 12px", background: BRAND_FAINT, borderRadius: "var(--border-radius-md)", border: `0.5px dashed ${BRAND}40`, cursor: "pointer", fontSize: 12, color: task.note ? "var(--color-text-secondary)" : BRAND, lineHeight: 1.65 }}>
                                  {task.note || "クリックしてメモを追加…"}
                                </div>
                              )
                            ) : (
                              <div style={{ minHeight: 40, padding: "10px 12px", background: BRAND_FAINT, borderRadius: "var(--border-radius-md)", border: `0.5px solid ${BRAND}25`, fontSize: 12, color: task.note ? "var(--color-text-secondary)" : BRAND, lineHeight: 1.65, opacity: task.note ? 1 : 0.65 }}>
                                {task.note || "（まだメモがありません）"}
                              </div>
                            )}
                          </div>

                          {!isManager && (
                            <button onClick={() => { onDeleteTask(viewIntern, task.id); setExpandedTask(null); }} style={{ alignSelf: "flex-start", fontSize: 11, padding: "4px 10px", background: "none", border: "0.5px solid #B02A2A35", borderRadius: "var(--border-radius-md)", cursor: "pointer", fontFamily: "var(--font-sans)", color: "#B02A2A" }}>タスクを削除</button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser]               = useState(null);
  const [tab, setTab]                 = useState("manual");
  const [now, setNow]                 = useState(Date.now());
  const [clockIn, setClockIn]         = useState(null);
  const [records, setRecords]         = useState([]);
  const [boards, setBoards]           = useState({});
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [loaded, setLoaded]           = useState(false);
  const [showMeeting, setShowMeeting] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoaded(false);
      if (user !== "マネージャー") {
        try { const ci = await window.storage.get(`clock:${user}`, true); setClockIn(ci ? JSON.parse(ci.value) : null); } catch { setClockIn(null); }
        try { const r  = await window.storage.get(`records:${user}`, true); setRecords(r ? JSON.parse(r.value) : []); } catch { setRecords([]); }
      }
      const all = {};
      for (const intern of INTERNS) {
        try { const b = await window.storage.get(`board:${intern}`, true); all[intern] = b ? JSON.parse(b.value) : []; } catch { all[intern] = []; }
      }
      setBoards(all);
      setLoaded(true);
    };
    load();
  }, [user]);

  const handleLogout = () => {
    setUser(null); setLoaded(false); setClockIn(null);
    setRecords([]); setBoards({}); setSelectedBoard(null); setTab("manual");
  };

  const handleClockIn = async () => {
    const ts = Date.now(); setClockIn(ts);
    try { await window.storage.set(`clock:${user}`, JSON.stringify(ts), true); } catch {}
  };

  const handleClockOut = async () => {
    if (!clockIn) return;
    const out = Date.now();
    const dur = Math.max(1, Math.round((out - clockIn) / 60000));
    const rec = { id: Date.now(), date: fmtDate(clockIn), clockIn: fmtTime(clockIn), clockOut: fmtTime(out), durationMin: dur };
    const nr  = [rec, ...records];
    setRecords(nr); setClockIn(null);
    try { await window.storage.set(`records:${user}`, JSON.stringify(nr), true); } catch {}
    try { await window.storage.delete(`clock:${user}`, true); } catch {}
  };

  const handleAddTask = async (intern, text) => {
    const task    = { id: Date.now(), text, status: "todo", content: "", note: "", createdAt: fmtDate(Date.now()) };
    const updated = { ...boards, [intern]: [task, ...(boards[intern] || [])] };
    setBoards(updated);
    try { await window.storage.set(`board:${intern}`, JSON.stringify(updated[intern]), true); } catch {}
  };

  const handleUpdateTask = async (intern, taskId, changes) => {
    const updated = { ...boards, [intern]: boards[intern].map(t => t.id === taskId ? { ...t, ...changes } : t) };
    setBoards(updated);
    try { await window.storage.set(`board:${intern}`, JSON.stringify(updated[intern]), true); } catch {}
  };

  const handleDeleteTask = async (intern, taskId) => {
    const updated = { ...boards, [intern]: boards[intern].filter(t => t.id !== taskId) };
    setBoards(updated);
    try { await window.storage.set(`board:${intern}`, JSON.stringify(updated[intern]), true); } catch {}
  };

  const totalMin = records.reduce((s, r) => s + (r.durationMin || 0), 0);
  const isManager = user === "マネージャー";

  if (!user)    return <UserSelect onSelect={setUser} />;
  if (!loaded)  return <div style={{ padding: "3rem", textAlign: "center", color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: "0.08em" }}>LOADING…</div>;

  return (
    <div style={{ minHeight: 600, fontFamily: "var(--font-sans)" }}>
      <Header user={user} onLogout={handleLogout} />
      <Nav tab={tab} setTab={setTab} isManager={isManager} />
      {tab === "manual"    && <ManualTab totalMin={totalMin} isManager={isManager} onMeeting={() => setShowMeeting(true)} />}
      {tab === "milestone" && <MilestoneTab />}
      {tab === "clock"     && !isManager && <ClockTab clockIn={clockIn} now={now} records={records} onClockIn={handleClockIn} onClockOut={handleClockOut} />}
      {tab === "board"     && <BoardTab user={user} isManager={isManager} boards={boards} selectedBoard={selectedBoard} setSelectedBoard={setSelectedBoard} onAddTask={handleAddTask} onUpdateTask={handleUpdateTask} onDeleteTask={handleDeleteTask} />}
      {showMeeting && <MeetingModal user={user} onClose={() => setShowMeeting(false)} />}
    </div>
  );
}
