#!/usr/bin/env node

/**
 * Test script for milestone notification job
 * This script can be run manually to test the milestone notification functionality
 */

const { create } = require('../lib/context');
const { milestoneNotificationJob } = require('../lib/jobs/milestone-notification-job');

async function testMilestoneNotifications() {
  console.log('Starting milestone notification test...');

  try {
    // Create context
    const context = await create();
    console.log('Context created successfully');

    // Run the milestone notification job
    const job = milestoneNotificationJob();
    await job.processWithheldMilestones(context);

    console.log('Milestone notification job completed successfully');
  } catch (error) {
    console.error('Error running milestone notification job:', error);
    process.exit(1);
  }
}

// Run the test
testMilestoneNotifications();
