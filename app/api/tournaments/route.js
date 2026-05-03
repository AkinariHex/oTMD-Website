import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/config/supabaseClient';

export async function POST(request) {
  try {
    const data = await request.json();

    let multipliers = {
      NM: { type: '*', value: data.mod_NM },
      HD: { type: '*', value: data.mod_HD },
      HR: { type: '*', value: data.mod_HR },
      DT: { type: '*', value: data.mod_DT },
      EZ: { type: '*', value: data.mod_EZ },
      FL: { type: '*', value: data.mod_FL },
      SD: { type: '*', value: data.mod_SD, failValue: '1.00' },
      HT: { type: '*', value: data.mod_HT },
    };

    let stagesObj = {
      stages: [],
    };

    let stagesArray = Object.entries(data).filter((entry) =>
      entry[0].startsWith('stage_')
    );

    stagesArray.forEach((stage) =>
      stagesObj.stages.push({
        stage: stage[0].replace('stage_', ''),
        date: stage[1],
      })
    );

    const { data: posted, error } = await supabaseAdmin
      .from(process.env.NEXT_PUBLIC_DB_TOURNAMENTS)
      .insert({
        acronym: data.acronym,
        name: data.name,
        description: data?.description,
        forumID: data?.forumID,
        website: data?.website,
        pickem: data?.pickem,
        stages: stagesObj,
        multipliers: multipliers,
        tourney_start: data.startDate,
        tourney_end: data.endDate,
        banner: data?.banner,
        host: data.host,
        requester: +data?.requester != 0 ? +data?.requester : null,
        moderator: +data.moderator,
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: posted });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}