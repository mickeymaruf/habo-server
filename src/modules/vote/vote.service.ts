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
  const groupVotes = await prisma.vote.groupBy({
    by: ["value"],
    where: { challengeId },
    _count: {
      _all: true,
    },
  });

  const upvotes = groupVotes.find((v) => v.value === 1)?._count._all || 0;
  const downvotes = groupVotes.find((v) => v.value === -1)?._count._all || 0;

  return {
    upvotes,
    downvotes,
    score: upvotes - downvotes,
  };
};

export const VoteService = {
  voteChallenge,
  removeVote,
  getChallengeVotes,
};
