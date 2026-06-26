import { EVENT, SCHEDULE, JUDGING, MENTORS, PRIZES } from '@/lib/event';

const kindStyle: Record<string, string> = {
  hack: 'border-orange-400',
  talk: 'border-indigo-400',
  break: 'border-slate-300',
  social: 'border-pink-400',
};

export default function About() {
  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-slate-900 p-8 text-white">
        <h1 className="text-3xl font-bold">{EVENT.name}</h1>
        <p className="mt-2 text-slate-300">{EVENT.dates} · {EVENT.location}</p>
        <p className="mt-1 text-slate-400">{EVENT.format}</p>
        <p className="mt-4 max-w-2xl font-semibold text-orange-300">{EVENT.theme}</p>
        <p className="mt-2 max-w-2xl text-slate-300">{EVENT.themeBlurb}</p>
        <p className="mt-4 max-w-2xl rounded-xl bg-white/10 p-3 text-sm text-amber-200">⚠ {EVENT.hardGate}</p>
      </section>

      <section>
        <h2 className="text-2xl font-bold">Program</h2>
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          {SCHEDULE.map((day) => (
            <div key={day.day}>
              <h3 className="font-bold">{day.day}</h3>
              <ul className="mt-3 space-y-2">
                {day.items.map((item, i) => (
                  <li key={i} className={`border-l-4 pl-3 ${kindStyle[item.kind]}`}>
                    <span className="font-mono text-sm text-slate-500">{item.time}</span>
                    <p className="text-sm">{item.what}{item.where ? ` · ${item.where}` : ''}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="card">
          <h2 className="text-xl font-bold">Judging criteria</h2>
          <ul className="mt-3 space-y-2">
            {JUDGING.map((j) => (
              <li key={j.criterion} className="text-sm">
                <b>{j.criterion} — {j.weight}</b>
                <br />
                <span className="text-slate-600">{j.note}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-bold">Mentors &amp; Jury</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {MENTORS.map((m) => <span key={m} className="chip">{m}</span>)}
            </div>
          </div>
          <div className="card">
            <h2 className="text-xl font-bold">Prizes</h2>
            <ul className="mt-3 space-y-1 text-sm">
              {PRIZES.map((p) => <li key={p.place}><b>{p.place}:</b> {p.prize}</li>)}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
