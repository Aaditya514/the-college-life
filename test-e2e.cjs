// Comprehensive End-to-End System Verification Suite
// The College Life We Didn't Have
// Tests: Auth, Stories, AI Content Moderation, Social Reactions, Saved Collections, Trending, Telemetry

const BASE_URL = 'http://localhost:8080/api';

async function runTests() {
  console.log('=====================================================');
  console.log('🚀 STARTING COMPREHENSIVE E2E VERIFICATION SUITE');
  console.log('=====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Authenticate as Admin
    console.log('--- 1. Authenticating as Admin ---');
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login: 'admin@thecollegelife.org', password: 'admin123' })
    });
    const adminLogin = await adminLoginRes.json();
    assert(adminLoginRes.status === 200, 'Admin login HTTP 200');
    assert(adminLogin.token && adminLogin.user.role === 'ADMIN', 'Admin JWT token issued with ROLE_ADMIN');
    const adminToken = adminLogin.token;

    // 2. Authenticate as Regular Student
    console.log('\n--- 2. Authenticating as Student User ---');
    const userLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login: 'wanderer42@alumni.ac.in', password: 'password123' })
    });
    const userLogin = await userLoginRes.json();
    assert(userLoginRes.status === 200, 'Student login HTTP 200');
    assert(userLogin.token && userLogin.user.pseudonym === 'wanderer_42', 'Student JWT token issued for @wanderer_42');
    const userToken = userLogin.token;

    // 3. Platform Telemetry Check
    console.log('\n--- 3. Platform Telemetry & Live Stats ---');
    const statsRes = await fetch(`${BASE_URL}/stories/stats`);
    const stats = await statsRes.json();
    assert(statsRes.status === 200, 'Stats endpoint HTTP 200');
    assert(stats.totalStories >= 1, `Total stories count: ${stats.totalStories}`);
    assert(typeof stats.totalViews === 'number', `Total views tracked: ${stats.totalViews}`);
    assert(typeof stats.totalReactions === 'number', `Total reactions tracked: ${stats.totalReactions}`);
    assert(stats.contributorCount >= 1, `Active pseudonymous contributors: ${stats.contributorCount}`);

    // 4. Time-Decay Trending Tags
    console.log('\n--- 4. Algorithmic Time-Decay Trending Tags ---');
    const trendingRes = await fetch(`${BASE_URL}/stories/trending-tags`);
    const trending = await trendingRes.json();
    assert(trendingRes.status === 200, 'Trending tags HTTP 200');
    assert(Array.isArray(trending) && trending.length > 0, `Trending tags count: ${trending.length}`);
    console.log(`    🔥 Top trending tag: #${trending[0].tag} (Velocity score: ${trending[0].count})`);

    // 5. Create a Clean Story
    console.log('\n--- 5. Story Lifecycle: Publishing Clean Story ---');
    const cleanStoryPayload = {
      title: 'Midnight conversations over hostel tap water and shared dreams',
      content: 'During our final semester, we sat on the cold floor of room 204. No tea, no coffee, just tap water in steel glasses. We spoke until 5 AM about what we wanted our lives to look like in ten years. None of us have achieved those specific dreams, but the warmth of that room still keeps us grounded.',
      pillar: 'NOSTALGIA',
      categorySlug: 'hostel-midnight-chai',
      pseudonym: 'chai_philosopher',
      tags: ['HostelLife', 'LateNightTalks', 'Friendship']
    };
    const createCleanRes = await fetch(`${BASE_URL}/stories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify(cleanStoryPayload)
    });
    const cleanStory = await createCleanRes.json();
    assert(createCleanRes.status === 201, 'Clean story created HTTP 201');
    assert(cleanStory.status === 'PUBLISHED', 'Clean story automatically approved as PUBLISHED');
    assert(cleanStory.id && cleanStory.viewsCount === 0, 'Clean story has valid UUID and initialized view count');
    const cleanStoryId = cleanStory.id;

    // 6. Test Atomic View Counter Increment
    console.log('\n--- 6. Atomic Story View Increment ---');
    const viewRes1 = await fetch(`${BASE_URL}/stories/${cleanStoryId}`);
    const storyAfterView1 = await viewRes1.json();
    assert(storyAfterView1.viewsCount === 1, `View count incremented to 1 on read (was ${cleanStory.viewsCount})`);
    const viewRes2 = await fetch(`${BASE_URL}/stories/${cleanStoryId}`);
    const storyAfterView2 = await viewRes2.json();
    assert(storyAfterView2.viewsCount === 2, `View count incremented to 2 on second read`);

    // 7. Test AI Safety Screening on Toxic / PII Content
    console.log('\n--- 7. AI Multi-Layer Safety Screening: Doxxing & Faculty Defamation ---');
    const toxicStoryPayload = {
      title: 'Warning everyone about Professor Sharma in the Math department',
      content: 'Do not take courses with Professor Sharma! He is terrible. You can call his mobile at 9876543210 or find his personal quarters in Staff Block B. I will make sure everyone boycotts his classes.',
      pillar: 'REGRET',
      categorySlug: 'academic-career-regrets',
      pseudonym: 'angry_student',
      tags: ['Boycott', 'ProfessorSharma']
    };
    const createToxicRes = await fetch(`${BASE_URL}/stories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify(toxicStoryPayload)
    });
    const toxicStory = await createToxicRes.json();
    assert(createToxicRes.status === 201, 'Story submission processed HTTP 201');
    assert(toxicStory.status === 'REJECTED', `Toxic story REJECTED by AI safety screening (status: ${toxicStory.status})`);

    // 8. Admin Moderation Desk: Verify Triaged Report
    console.log('\n--- 8. Admin Moderation Desk: Reviewing Flagged Queue ---');
    const reportsRes = await fetch(`${BASE_URL}/moderation/reports?status=PENDING`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const reports = await reportsRes.json();
    assert(reportsRes.status === 200, 'Admin reports queue HTTP 200');
    assert(Array.isArray(reports) && reports.length > 0, `Pending moderation reports found: ${reports.length}`);
    const flaggedReport = reports.find(r => r.storyId === toxicStory.id);
    assert(flaggedReport !== undefined, `Toxic story (${toxicStory.id}) auto-routed to moderation queue`);
    if (flaggedReport) {
      console.log(`    🔍 Reason: "${flaggedReport.reason}"`);
      console.log(`    📝 Details: "${flaggedReport.details}"`);
    }

    // 9. Admin Moderation Action: Take Down / Resolve Report
    console.log('\n--- 9. Admin Moderation Desk: Actioning Report ---');
    if (flaggedReport) {
      const actionRes = await fetch(`${BASE_URL}/moderation/reports/${flaggedReport.id}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ actionType: 'REMOVE_STORY', notes: 'Confirmed PII violation (faculty phone number and staff quarters)' })
      });
      assert(actionRes.status === 200, 'Admin action HTTP 200');
      const actionResult = await actionRes.json();
      assert(actionResult.status === 'RESOLVED', 'Report status changed to RESOLVED');
    }

    // 10. Social Reactions Engine: Toggle Reactions
    console.log('\n--- 10. Social Reaction Engine: Toggle Relatable ---');
    const reactRes1 = await fetch(`${BASE_URL}/stories/${cleanStoryId}/reactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({ reactionType: 'RELATABLE' })
    });
    const reactResult1 = await reactRes1.json();
    assert(reactRes1.status === 200, 'Reaction toggle HTTP 200');
    assert(reactResult1.userReactions.includes('relatable') && reactResult1.counts.relatable >= 1, 'Reaction added, userReactions has "relatable" and relatable >= 1');

    // Toggle reaction again to remove it
    const reactRes2 = await fetch(`${BASE_URL}/stories/${cleanStoryId}/reactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({ reactionType: 'RELATABLE' })
    });
    const reactResult2 = await reactRes2.json();
    assert(reactRes2.status === 200, 'Reaction untoggle HTTP 200');
    assert(!reactResult2.userReactions.includes('relatable'), 'Reaction toggled off, userReactions is empty');

    // Toggle back on
    await fetch(`${BASE_URL}/stories/${cleanStoryId}/reactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({ reactionType: 'RELATABLE' })
    });

    // 11. Saved Collections Sync
    console.log('\n--- 11. Instagram-Style Saved Collections ---');
    const createColRes = await fetch(`${BASE_URL}/collections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        name: 'Late Night Reflections',
        iconEmoji: '🌙'
      })
    });
    const newCol = await createColRes.json();
    assert(createColRes.status === 201, 'Collection created HTTP 201');
    assert(newCol.id && newCol.iconEmoji === '🌙', 'Collection saved in PostgreSQL with custom iconEmoji');

    // Add clean story to collection via POST /api/collections/{id}/stories/{storyId}
    const addStoryToColRes = await fetch(`${BASE_URL}/collections/${newCol.id}/stories/${cleanStoryId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });
    const updatedCol = await addStoryToColRes.json();
    assert(addStoryToColRes.status === 200, 'Story added to collection HTTP 200');
    assert(Array.isArray(updatedCol.storyIds) && updatedCol.storyIds.includes(cleanStoryId), 'Story ID verified inside collection storyIds array');

    // 12. Final Telemetry Verification
    console.log('\n--- 12. Final Telemetry Update Verification ---');
    const finalStatsRes = await fetch(`${BASE_URL}/stories/stats`);
    const finalStats = await finalStatsRes.json();
    assert(finalStats.totalStories > stats.totalStories, `Total stories incremented (${stats.totalStories} -> ${finalStats.totalStories})`);
    assert(finalStats.totalViews > stats.totalViews, `Total views incremented (${stats.totalViews} -> ${finalStats.totalViews})`);

    // 13. Student Appeal Channel Test
    console.log('\n--- 13. Student Appeal Channel: Dispute AI Safety Flag ---');
    const borderStoryPayload = {
      title: 'Visiting the dairy institute in Anand during winter break',
      content: 'We took the morning train to Anand to inspect the rural processing units. The campus was serene and the winter fog felt comforting. A true collegiate expedition.',
      pillar: 'NOSTALGIA',
      categorySlug: 'hostel-midnight-chai',
      pseudonym: 'curious_traveler',
      tags: ['Travel', 'CollegeTrip']
    };
    const createBorderRes = await fetch(`${BASE_URL}/stories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify(borderStoryPayload)
    });
    const borderStory = await createBorderRes.json();
    assert(createBorderRes.status === 201, 'Story submitted HTTP 201');
    assert(borderStory.status === 'PENDING' || borderStory.status === 'REJECTED', `Borderline name 'Anand' flagged for review (status: ${borderStory.status})`);

    const appealRes = await fetch(`${BASE_URL}/stories/${borderStory.id}/appeal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({ reason: 'Anand is a campus city in Gujarat, not an individual student or batchmate.' })
    });
    const appealData = await appealRes.json();
    assert(appealRes.status === 201, 'Student appeal submitted HTTP 201');
    assert(appealData.status === 'PENDING', 'Appeal registered with status PENDING');

    // 14. Admin Adjudication & Active Learning Loop
    console.log('\n--- 14. Editorial Adjudication & Active Learning Feedback ---');
    const appealsRes = await fetch(`${BASE_URL}/moderation/appeals?status=PENDING`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const pendingAppeals = await appealsRes.json();
    assert(appealsRes.status === 200, 'Appeals queue fetched HTTP 200');
    const targetAppeal = pendingAppeals.find(a => a.id === appealData.id);
    assert(targetAppeal !== undefined, 'Target appeal found in editorial queue');

    if (targetAppeal) {
      const resolveRes = await fetch(`${BASE_URL}/moderation/appeals/${targetAppeal.id}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          approve: true,
          notes: 'Geographic entity Anand validated. Overruling AI safety flag and feeding back as active learning hard negative.'
        })
      });
      const resolvedAppeal = await resolveRes.json();
      assert(resolveRes.status === 200, 'Appeal resolve HTTP 200');
      assert(resolvedAppeal.status === 'APPROVED', 'Appeal resolved to APPROVED');

      // Verify the story status was updated to PUBLISHED
      const updatedStoryRes = await fetch(`${BASE_URL}/stories/${borderStory.id}`);
      const updatedStory = await updatedStoryRes.json();
      assert(updatedStory.status === 'PUBLISHED', 'Story status promoted to PUBLISHED after successful editorial appeal');
    }

  } catch (err) {
    console.error('Unhandled test execution error:', err);
    failed++;
  }

  console.log('\n=====================================================');
  console.log(`📊 TEST SUITE SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log('=====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
