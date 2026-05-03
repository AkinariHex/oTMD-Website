import TournamentContent from '@/components/Tournaments/TournamentContent';
import { supabaseAdmin } from '@/config/supabaseClient';

function updateTournamentStatus(tournaments) {
  let todayDate = new Date();

  return tournaments.map((item) => {
    let tournamentStartDate = new Date(item.tourney_start);
    let tournamentEndDate = new Date(item.tourney_end);

    if (todayDate > tournamentStartDate && todayDate < tournamentEndDate) {
      item.status = true;
      item.statusText = 'active';
      item.statusClass = 'active';
    } else if (tournamentEndDate < todayDate) {
      item.status = false;
      item.statusText = 'ended';
      item.statusClass = 'ended';
    } else if (todayDate < tournamentStartDate) {
      var Difference_In_Time = tournamentStartDate - todayDate;
      var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
      item.status = true;
      item.statusText =
        Math.floor(Difference_In_Days) == 0
          ? 'Tomorrow'
          : `in ${Math.floor(Difference_In_Days)} days`;
      item.statusClass = 'pending';
    }

    item.stages =
      typeof item.stages !== 'string' ? item.stages : JSON.parse(item.stages);

    var prevDate = todayDate - 86400000;
    var stageStatus = [];

    item.stages.stages.forEach((el) => {
      let stageDate = new Date(el.date);
      if (prevDate === null) prevDate = stageDate;
      if (todayDate > stageDate && todayDate > prevDate) {
        stageStatus.push('is-complete');
      } else if (todayDate <= stageDate && todayDate > prevDate) {
        stageStatus.push('is-active');
      } else if (todayDate > prevDate && todayDate < stageDate) {
        stageStatus.push('');
      }
      prevDate = stageDate;
    });

    item.stagesStatus = stageStatus;

    return item;
  });
}

async function getTournaments() {
  var { data, error } = await supabaseAdmin
    .from(process.env.NEXT_PUBLIC_DB_TOURNAMENTS)
    .select(
      'acronym, UUID, name, forumID, website, pickem, isActive, stages, multipliers, tourney_start, tourney_end, banner, host, description'
    )
    .order('tourney_end', { ascending: true });

  if (error || !data) {
    return [];
  }

  data = await data.sort((a, b) => {
    let date1 = new Date(a.tourney_end);
    let date2 = new Date(b.tourney_end);

    return date2 - date1;
  });

  data.length = 15;

  data = updateTournamentStatus(data);

  return data;
}

export const revalidate = 20;

export const metadata = {
  title: 'Tournaments',
  description: '',
};

export default async function Tournaments() {
  const tournamentsData = await getTournaments();

  return (
    <>
      <h1>Tournaments</h1>
      <TournamentContent tournaments={tournamentsData} />
    </>
  );
}
