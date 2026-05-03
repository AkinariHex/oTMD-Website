export default async function handler(req, res) {
  const { user_id } = req.query;
  const { authorization } = req.headers;

  const data = await fetch(`https://osu.ppy.sh/api/v2/users/${user_id}/osu`, {
    method: 'GET',
    headers: {
      Authorization: authorization,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  }).then((res) => res.json());

  return res.json(data);
}
