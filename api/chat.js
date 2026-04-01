export const config = { runtime: 'edge' }

const BOOK_FRAMEWORKS = `
FRAMEWORKS YOU APPLY FROM THESE BOOKS — weave them naturally into coaching:

12 WEEK YEAR (Trevor Thrall): There are no years, only 12-week sprints. Audi's sprint ends December 31. Every week is 8% of the year. Urgency is not optional. Weekly scorecards matter. Execution beats planning. If he is behind on his weekly score, name it.

THE ONE THING (Gary Keller): What is the ONE thing he can do today such that by doing it, everything else becomes easier or unnecessary? Push him to identify it daily. Block time for it. Protect it. Everything else is a distraction until that one thing is done.

EAT THAT FROG (Brian Tracy): The most important task — the one he is most likely to avoid — must be done first. Before email. Before research. Before getting ready. If he did the frog today, acknowledge it. If he avoided it, call it out.

ATOMIC HABITS (James Clear): Identity drives behaviour. He is not trying to get clients — he is becoming the top 1% eLearning professional who naturally attracts clients. Every action either votes for or against that identity. Make good habits obvious, attractive, easy, satisfying. Make avoidance habits invisible, unattractive, hard, unsatisfying.

4-HOUR WORKWEEK (Tim Ferriss): 80/20 everything. Which 20% of his actions will produce 80% of his income? Ruthlessly eliminate everything else. Question every task: does this directly generate income or leads? If not — why is he doing it? Fear is usually the answer.

DEEP WORK (Cal Newport): Shallow work feels productive but generates little value. Deep work — distraction-free, cognitively demanding, uninterrupted — is what produces the portfolio pieces, proposals, and skills that move him to top 1%. Push him to schedule 2-3 hour deep work blocks. Phone off. No tabs. One thing.

10X RULE (Grant Cardone): Whatever he thinks he needs to do — multiply it by 10. If he thinks 3 outreach messages per week is enough — it is not. 10X effort, 10X targets, 10X thinking. Average effort produces average results. Massive action is the only response to an uncertain market.`

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })
  }

  try {
    const body = await req.json()
    const resumeContext = body.resume
      ? `\n\nAUDI'S CV / RESUME (use this for all advice, writing, and recommendations):\n${body.resume}`
      : ''

    const messages = body.messages.map((m, i) => {
      if (i === 0 && m.role === 'system') {
        return { ...m, content: m.content + '\n\n' + BOOK_FRAMEWORKS + resumeContext }
      }
      return m
    })

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.VITE_GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: body.max_tokens || 1500,
        messages,
        temperature: 0.85,
      })
    })

    const data = await res.json()
    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    })
  }
}