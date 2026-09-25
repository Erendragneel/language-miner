const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('assert/strict');

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 900 },
      serviceWorkers: 'block'
    });
    const user = {
      id: 'picture-audio-qa', email: 'qa@example.invalid',
      user_metadata: {
        display_name: 'Picture Audio QA', account_role: 'adult_guardian',
        terms_version: '2026-08-15-v1', privacy_version: '2026-08-15-v1'
      }
    };
    let savedRow = null;
    await context.route('**/*.supabase.co/**', async route => {
      const url = route.request().url();
      let body = [];
      if (url.includes('/auth/v1/user')) body = user;
      else if (url.includes('/rpc/load_player_save')) body = savedRow ? [savedRow] : [];
      else if (url.includes('/rpc/save_player_state')) {
        const payload = route.request().postDataJSON();
        savedRow = {
          user_id: user.id, game_state: payload.p_game_state,
          course_settings: payload.p_course_settings,
          revision: (savedRow?.revision || 0) + 1, updated_at: new Date().toISOString()
        };
        body = [{ ...savedRow, accepted: true }];
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
    });
    await context.addInitScript(user => {
      const profileId = 'cloud-' + user.id;
      localStorage.setItem('jm_profiles', JSON.stringify([{ id: profileId, name: 'Picture Audio QA', cloudUserId: user.id }]));
      localStorage.setItem('jm_active_profile', profileId);
      localStorage.setItem('jm_profile_' + profileId, JSON.stringify({
        onboardingComplete: true, placementTestCompleted: true,
        voiceEnabled: false, autoSpeak: false, hearts: 14, maxHearts: 14
      }));
      localStorage.setItem('lm_multilingual_functional_preview_v1:cloud:' + user.id,
        JSON.stringify({ known: 'en', learning: 'ja', placements: { ja: { status: 'tested' } } }));
      localStorage.setItem('lm_cloud_session_v2', JSON.stringify({
        accessToken: 'qa-test', refreshToken: 'qa-refresh', expiresAt: 9999999999, user
      }));
    }, user);
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(process.env.TEST_URL || 'http://127.0.0.1:8765/index.html');
    await page.waitForFunction(() => window.LanguageMinerPictures && window.LanguageMinerPracticeModes && typeof state === 'object');
    if (await page.locator('#lmMultilingualOverlay.open').count()) await page.locator('#lmFlowClose').click();

    async function showFire({ difficulty = 'easy', reverse = false, smartReview = true, mode = 'reading' } = {}) {
      await page.evaluate(({ difficulty, reverse, smartReview, mode }) => {
        const original = questions.find(question => question.vocabularyKey === '火' &&
          (reverse ? question.prompt === 'Choose the reading.' : /meaning/i.test(question.prompt)));
        if (!original) throw new Error('Missing production fire vocabulary question');
        state.quizDifficulty = difficulty;
        state.practiceMode = mode;
        state.active = { ...original, opts: [...original.opts], smartReview };
        state.answered = false;
        showQuestion(state.active);
      }, { difficulty, reverse, smartReview, mode });
      assert.equal(await page.locator('#challengeArea .lm-quiz-art').count(), 1, 'The question has a real picture to protect');
    }

    for (const difficulty of ['easy', 'hard']) {
      // Smart Review bypasses practice presentation, even when Picture is selected elsewhere.
      await showFire({ difficulty, mode: 'picture' });
      assert.equal(await page.locator('#speakQuestionBtn').isVisible(), true, 'Question audio stays available');
      assert.equal(await page.locator('.question-card').getAttribute('data-practice-mode'), null);
      assert.equal(await page.locator('.lm-quiz-art').isVisible(), false, `${difficulty}: hide the answer picture`);
      assert.equal(await page.locator('.lm-quiz-scene').evaluate(node => node.classList.contains('lm-hard-recall')), true,
        'Hidden art does not leave an empty image column');
      const wrong = await page.evaluate(() => state.active.opts.find(option => option !== state.active.a));
      await page.locator('#answers').getByRole('button', { name: wrong, exact: true }).click();
      assert.equal(await page.evaluate(() => state.answered), false, 'Wrong Smart Review answers permit another attempt');
      assert.equal(await page.locator('.lm-quiz-art').isVisible(), false, 'A wrong attempt must not reveal the next answer');
      await page.evaluate(() => LanguageMinerPictures.revealAfterAnswer(document.getElementById('challengeArea')));
      assert.equal(await page.locator('.lm-quiz-art').isVisible(), false, 'Feedback reveal cannot expose an audio-question picture');
    }

    await showFire({ reverse: true });
    assert.equal(await page.locator('#speakQuestionBtn').count(), 0, 'Reverse questions do not speak the answer');
    assert.equal(await page.locator('.lm-quiz-art').isVisible(), true, 'Easy reverse questions can illustrate their known-language clue');
    await showFire({ reverse: true, difficulty: 'hard' });
    assert.equal(await page.locator('.lm-quiz-art').isVisible(), false, 'Hard recall still hides the reverse-question clue');
    await page.evaluate(() => LanguageMinerPictures.revealAfterAnswer(document.getElementById('challengeArea')));
    assert.equal(await page.locator('.lm-quiz-art').isVisible(), true, 'Non-audio hard recall keeps its existing feedback reveal');

    for (const difficulty of ['easy', 'hard']) {
      await showFire({ difficulty, smartReview: false, mode: 'picture' });
      assert.equal(await page.locator('.lm-quiz-art').isVisible(), true, 'Explicit Picture practice keeps its picture clue');
      assert.equal(await page.locator('#speakQuestionBtn').isVisible(), false, 'Picture practice hides audio controls');
      for (const mode of ['listening', 'reading']) {
        await page.evaluate(mode => LanguageMinerPracticeModes.select(mode), mode);
        assert.equal(await page.locator('.lm-quiz-art').isVisible(), false, `${mode} practice keeps art hidden`);
        await page.evaluate(() => LanguageMinerPictures.revealAfterAnswer(document.getElementById('challengeArea')));
        assert.equal(await page.locator('.lm-quiz-art').isVisible(), false, `${mode} feedback keeps art hidden`);
      }
    }

    assert.deepEqual(errors, [], 'No browser errors');
    console.log('PASS: audio Smart Review hides answer pictures on easy/hard and retries; reverse clues and explicit Picture practice are preserved.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
