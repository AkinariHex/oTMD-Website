import { getSession } from 'next-auth/react';
import { useState } from 'react';
import Collapsible from 'react-collapsible';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { ExternalLink } from 'react-external-link';
import EditTournament from '../../components/Forms/EditTournament';
import TournamentRequest from '../../components/Forms/TournamentRequest';
import supabase from '../../config/supabaseClient';

export default function Account({
  session,
  userStatus,
  requests,
  mytournaments,
}) {
  let statusColor = {
    Server: 'rgb(197, 56, 56)',
    'Tourney Manager': 'rgb(48, 164, 226)',
    'Tournaments Host': 'rgb(226, 168, 48)',
    Tester: 'hsl(276, 30%, 60%)',
    User: 'rgb(20,20,20)',
  };

  let joinDate = new Date(userStatus.dateJoin * 1000);
  let nowDate = new Date();
  var DateDiff = {
    inDays: function (d1, d2) {
      return parseInt((d2 - d1) / (24 * 3600 * 1000));
    },

    inWeeks: function (d1, d2) {
      return parseInt((d2 - d1) / (24 * 3600 * 1000 * 7));
    },

    inMonths: function (d1, d2) {
      var d1Y = d1.getFullYear();
      var d2Y = d2.getFullYear();
      var d1M = d1.getMonth();
      var d2M = d2.getMonth();

      return d2M + 12 * d2Y - (d1M + 12 * d1Y);
    },

    inYears: function (d1, d2) {
      return d2.getFullYear() - d1.getFullYear();
    },
  };

  const [tournamentList, setTournamentList] = useState(['action', 'down']);
  const [tournamentForm, setTournamentForm] = useState(['action', 'down']);

  return (
    <div className="homeContent">
      <div className="accountContainer">
        <div className="profileInfo">
          <div className="userMain">
            <img src={session.avatar_url} alt="User Image" />
            <div className="profileName">
              {session.username}
              <span
                style={{ backgroundColor: statusColor[userStatus.permissions] }}
                id="role"
              >
                {userStatus.permissions}
              </span>
            </div>
            <div className="timeProfile">
              Joined from {DateDiff.inDays(joinDate, nowDate)} days
            </div>
          </div>
          <div className="userSocial">
            {userStatus.twitter && (
              <ExternalLink
                id="twitter"
                href={`https://twitter.com/${userStatus.twitter}`}
              >
                <i className="bx bxl-twitter"></i>
                {userStatus.twitter}
              </ExternalLink>
            )}
            {userStatus.discord && (
              <CopyToClipboard text={userStatus.discord}>
                <ExternalLink id="discord">
                  <i className="bx bxl-discord-alt"></i>
                  {userStatus.discord}
                </ExternalLink>
              </CopyToClipboard>
            )}
          </div>
        </div>
        <div className="profileActions">
          <div className="actionsContainer">
            {mytournaments.length > 0 && (
              <div className="actionCategory">
                <h2>Your Active Tournaments</h2>
                <div className="actionCentre">
                  {mytournaments.map((tournament, index) => {
                    if (tournament.tourney_end) {
                      let todayDate = new Date();
                      let tDate = tournament.tourney_end.split('/');
                      let endDate = new Date(tDate[2], tDate[0] - 1, tDate[1]);
                      return (
                        todayDate < endDate && (
                          <EditTournament
                            key={index}
                            profile={userStatus}
                            session={session}
                            tournament={tournament}
                          />
                        )
                      );
                    } else {
                      return (
                        <EditTournament
                          key={index}
                          profile={userStatus}
                          session={session}
                          tournament={tournament}
                        />
                      );
                    }
                  })}
                </div>
              </div>
            )}
            {(userStatus.permissions === 'Server' ||
              userStatus.permissions === 'Tourney Manager') && (
              <div className="actionCategory">
                <h2>Tournaments Management</h2>
                <div className="actionCentre">
                  <div className="action">
                    <div className="text">Manage tournament requests</div>
                    <div className="utilityIcon">
                      <i className="bx bxs-down-arrow"></i>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="actionCategory">
              <h2>Tournaments</h2>
              <div className="actionCentre">
                <Collapsible
                  onTriggerOpening={() => {
                    setTournamentList(['actionOpen', 'up']);
                  }}
                  onTriggerClosing={() => {
                    setTournamentList(['action', 'down']);
                  }}
                  transitionTime="200"
                  easing="ease-out"
                  trigger={
                    <div className={tournamentList[0]}>
                      <div className="tn">
                        <div className="text">Your tournament requests</div>
                        {requests.length > 0 && (
                          <div className="number">{requests.length}</div>
                        )}
                      </div>
                      <div className="utilityIcon">
                        <i className={`bx bxs-${tournamentList[1]}-arrow`}></i>
                      </div>
                    </div>
                  }
                >
                  <div className="collapsibleBody">
                    {requests.length > 0 &&
                      requests.map((item, index) => {
                        return (
                          <ExternalLink
                            href={item.forumID}
                            className="item"
                            key={index}
                          >
                            <div className="text">
                              <div id="acronym">{item.acronym}</div>
                              <div id="name">{item.name}</div>
                            </div>
                            <span className={`status ${item.status}`}>
                              <span>{item.status}</span>
                            </span>
                          </ExternalLink>
                        );
                      })}
                    {requests.length === 0 && (
                      <div id="noRequests">No requests</div>
                    )}
                  </div>
                </Collapsible>
                <Collapsible
                  onTriggerOpening={() => {
                    setTournamentForm(['actionOpen', 'up']);
                  }}
                  onTriggerClosing={() => {
                    setTournamentForm(['action', 'down']);
                  }}
                  transitionTime="200"
                  easing="ease-out"
                  trigger={
                    <div className={tournamentForm[0]}>
                      <div className="text">Request a tournament</div>
                      <div className="utilityIcon">
                        <i className={`bx bxs-${tournamentForm[1]}-arrow`}></i>
                      </div>
                    </div>
                  }
                >
                  <TournamentRequest profile={userStatus} session={session} />
                </Collapsible>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps(context) {
  // Get user session
  const session = await getSession(context);

  const statusData =
    session !== null
      ? await (
          await supabase
            .from('users')
            .select('ID,UUID,permissions,twitter,discord,dateJoin')
            .eq('ID', session.id)
        ).data[0]
      : [{}];

  var requests =
    session !== null
      ? await (
          await supabase
            .from(`${process.env.NEXT_PUBLIC_DB_TOURNEY_REQUESTS}`)
            .select('*')
            .eq('requester', session.id)
        ).data
      : [{}];

  var mytournaments =
    session !== null
      ? await (
          await supabase
            .from(`${process.env.NEXT_PUBLIC_DB_TOURNAMENTS}`)
            .select('*')
            .contains('host', { id: session.id })
        ).data
      : [{}];

  const returnProps =
    session === null
      ? {
          redirect: {
            destination: '/',
            permanent: false,
          },
        }
      : {
          props: {
            session: session,
            userStatus: statusData,
            requests: requests,
            mytournaments: mytournaments,
          },
        };

  return { ...returnProps };
}
