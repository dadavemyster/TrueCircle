export function shouldHidePost(post) {
  const up = post.upvotes || 0;
  const down = post.downvotes || 0;
  const total = up + down;

  if (total > 5) {
    const score = up / total;
    return score < 0.25;
  }
  return false;
}