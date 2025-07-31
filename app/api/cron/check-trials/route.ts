import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateTrialEndDate } from '@/lib/subscription-utils';

export async function POST(request: NextRequest) {
  try {
    // Verify the request is coming from Vercel Cron or has correct auth
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Running trial expiration check...');

    // Get all users with free trial status
    const trialUsers = await prisma.user.findMany({
      where: {
        subscriptionStatus: 'free_trial'
      },
      select: {
        id: true,
        email: true,
        trialStartDate: true,
        trialEndDate: true,
      }
    });

    let expiredCount = 0;
    const now = new Date();

    for (const user of trialUsers) {
      const trialEndDate = user.trialEndDate || calculateTrialEndDate(user.trialStartDate);
      
      // If trial has expired, update user status
      if (trialEndDate <= now) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            subscriptionStatus: 'expired',
            trialEndDate: trialEndDate
          }
        });
        
        expiredCount++;
        console.log(`Expired trial for user: ${user.email}`);
      } else if (!user.trialEndDate) {
        // Set trial end date if it's not set
        await prisma.user.update({
          where: { id: user.id },
          data: {
            trialEndDate: trialEndDate
          }
        });
      }
    }

    console.log(`Trial check completed. ${expiredCount} trials expired.`);

    return NextResponse.json({
      success: true,
      data: {
        checkedUsers: trialUsers.length,
        expiredTrials: expiredCount
      }
    });

  } catch (error) {
    console.error('Error in trial expiration check:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}