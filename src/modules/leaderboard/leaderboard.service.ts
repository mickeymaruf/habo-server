import { prisma } from "../../lib/prisma";

const getTopChallenges = async () => {
  const challenges = await prisma.challenge.findMany({
    where: {
      // status: "APPROVED",
    },
    include: {
      _count: {
        select: {
          participations: { where: { status: "ACTIVE" } },
          votes: true,
          comments: true,
        },
      },
      participations: {
        where: { status: "ACTIVE" },
        take: 3,
        orderBy: {
          progress: "desc", // Show the users closest to finishing first
        },
        include: {
          user: {
            select: { id: true, name: true, image: true, createdAt: true },
          },
          // Fetch the most recent logs to check the streak
          progressLogs: {
            orderBy: { date: "desc" },
            take: 10, // Adjust based on how far back you want to check streaks
          },
        },
      },
    },
  });

  const leaderboard = challenges
    .map((challenge) => {
      const participantCount = challenge._count.participations;
      const voteCount = challenge._count.votes;
      const commentCount = challenge._count.comments;

      const score = participantCount * 5 + voteCount * 2 + commentCount * 1;

      // Transform Top 3 Participants
      const topParticipants = challenge.participations.map((p) => {
        return {
          name: p.user.name,
          image: p.user.image,
          completionPercentage: p.progress, // e.g., 85
          // Logic to show "Day X of TotalDays"
          currentDay: p.progressLogs.length,
          totalDays: challenge.durationDays,
          // Basic Streak Calculation (Consecutive days logged)
          streak: calculateStreak(p.progressLogs),
          memberSince: p.user.createdAt,
        };
      });

      return {
        id: challenge.id,
        title: challenge.title,
        category: challenge.category,
        isPremium: challenge.isPremium,
        duration: challenge.durationDays,
        participantCount,
        voteCount,
        commentCount,
        score,
        topParticipants,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return leaderboard;
};

// Helper function to calculate streak from logs
const calculateStreak = (logs: any[]) => {
  if (logs.length === 0) return 0;
  // This is a simplified version; you'd compare log dates to current date
  return logs.length;
};

const getTopUsers = async () => {
  const users = await prisma.user.findMany({
    where: {
      status: "ACTIVE",
      isDeleted: false,
    },
    select: {
      id: true,
      name: true,
      image: true,
      _count: {
        select: {
          participations: { where: { completed: true } }, // Total challenges finished
        },
      },
      participations: {
        where: { status: "ACTIVE" },
        select: {
          progress: true,
          progressLogs: {
            orderBy: { date: "desc" },
            take: 1, // To check the last check-in for streak status
          },
          _count: {
            select: { progressLogs: true }, // Total daily check-ins
          },
        },
      },
    },
  });

  const userLeaderboard = users
    .map((user) => {
      // Calculate total daily check-ins across all challenges
      const totalCheckIns = user.participations.reduce(
        (acc, p) => acc + p._count.progressLogs,
        0,
      );

      // Points Logic
      const completionPoints = user._count.participations * 50;
      const checkInPoints = totalCheckIns * 10;

      const totalScore = completionPoints + checkInPoints;

      return {
        id: user.id,
        name: user.name,
        image: user.image,
        totalScore,
        challengesCompleted: user._count.participations,
        activeCheckIns: totalCheckIns,
      };
    })
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, 10);

  return userLeaderboard;
};

export const LeaderboardService = {
  getTopChallenges,
  getTopUsers,
};
