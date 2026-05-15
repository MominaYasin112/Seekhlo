const ML_URL = import.meta.env.VITE_ML_URL || 'http://localhost:8001'
const RUNNER_URL = import.meta.env.VITE_RUNNER_URL || 'http://localhost:8002'

export async function fetchRecommendations({ scores, completedIds = [], skippedIds = [], limit = 10 }) {
  try {
    const res = await fetch(`${ML_URL}/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scores,
        completed_module_ids: completedIds,
        skipped_module_ids: skippedIds,
        limit,
      }),
    })
    if (!res.ok) throw new Error('ML service error')
    return await res.json()
  } catch {
    return getDefaultPath(completedIds, skippedIds, limit)
  }
}

export async function getDefaultPath(completedIds, skippedIds, limit) {
  try {
    const res = await fetch(`${ML_URL}/recommend/fallback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scores: {},
        completed_module_ids: completedIds,
        skipped_module_ids: skippedIds,
        limit,
      }),
    })
    if (res.ok) return await res.json()
  } catch { /* offline */ }

  const { MODULE_CATALOG } = await import('../data/modules')
  const order = { Beginner: 0, Intermediate: 1, Advanced: 2 }
  const modules = MODULE_CATALOG
    .filter(m => !completedIds.includes(m.id) && !skippedIds.includes(m.id))
    .sort((a, b) => (order[a.difficulty] ?? 9) - (order[b.difficulty] ?? 9))
    .slice(0, limit)
  return { modules, source: 'default' }
}

export async function runCodeTests({ code, testCases, challengeId }) {
  try {
    const res = await fetch(`${RUNNER_URL}/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, test_cases: testCases, challenge_id: challengeId }),
    })
    if (!res.ok) throw new Error('Runner error')
    return await res.json()
  } catch {
    return mockRunTests(code, testCases)
  }
}

export async function saveDraft(challengeId, code, userId) {
  try {
    await fetch(`${RUNNER_URL}/draft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ challenge_id: challengeId, code, user_id: userId }),
    })
  } catch { /* save locally handled in component */ }
}

/** Offline fallback: simple factorial evaluator */
function mockRunTests(code, testCases) {
  const results = testCases.map(tc => {
    try {
      const fn = new Function('n', `
        ${code}
        return factorial(n);
      `)
      const actual = String(fn(Number(tc.input)))
      const passed = actual === tc.expected
      return { passed, input: tc.input, expected: tc.expected, actual, error: null }
    } catch (e) {
      return { passed: false, input: tc.input, expected: tc.expected, actual: null, error: e.message }
    }
  })
  return { results, all_passed: results.every(r => r.passed) }
}
