import { prisma } from "../../lib/prisma";

const voteChallenge = async (
  userId: string,
  payload: {
    challengeId: string;
    value: 1 | -1;
  },
) => {
  return prisma.vote.upsert({
    where: {
      userId_challengeId: {
        userId,
        challengeId: payload.challengeId,
      },
    },
    update: {
      value: payload.value,
    },
    create: {
      userId,
      challengeId: payload.challengeId,
      value: payload.value,
    },
  });
};

const removeVote = async (userId: string, challengeId: string) => {
  return prisma.vote.delete({
    where: {
      userId_challengeId: {
        userId,
        challengeId,
      },
    },
  });
};

const getChallengeVotes = async (challengeId: string) => {
  const votes = await prisma.vote.findMany({
    where: { challengeId },
    select: {
      value: true,
    },
  });

  return {
    upvotes: votes.filter((v) => v.value === 1).length,
    downvotes: votes.filter((v) => v.value === -1).length,
    score: votes.reduce((acc, vote) => acc + vote.value, 0),
  };
};

export const VoteService = {
  voteChallenge,
  removeVote,
  getChallengeVotes,
};
