'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import styles from './form.module.css';

async function sendToDiscord(tournament) {
  let discordEmoji = {
    NM: '<:nomod:868095234217750558>',
    HD: '<:hidden:868095234150658079>',
    HR: '<:hardrock:868095234129690664>',
    DT: '<:doubletime:868095234079350844>',
    EZ: '<:easy:868095234108710922>',
    FL: '<:flashlight:868095233932533781>',
    HT: '<:halftime:943890234330972160>',
    SD: 'SD',
  };

  let customMultipliers = [];

  let multipliersArray = Object.entries(tournament).filter((entry) =>
    entry[0].startsWith('mod_')
  );

  await multipliersArray.forEach((mod) => {
    if (mod[1] != '1.00') {
      customMultipliers.push({
        mod: mod[0].replace('mod_', ''),
        value: mod[1],
      });
    }
  });

  let jsonData = {
    embeds: [
      {
        author: {
          name: `New Tournament${
            tournament.host ? ` by ${tournament.host.username}` : ''
          }`,
          url: tournament.host
            ? `https://osu.ppy.sh/users/${tournament.host.id}`
            : '',
          icon_url: tournament.host
            ? `http://s.ppy.sh/a/${tournament.host.id}`
            : '',
        },
        title: tournament.name,
        description: `${
          tournament.description ? `${tournament.description}\n\n` : ''
        }${
          customMultipliers.length > 0
            ? `**Custom Multipliers**\n${customMultipliers
                .map(
                  (multiplier) =>
                    `${discordEmoji[multiplier.mod]}: **${multiplier.value}x**`
                )
                .join(' - ')}`
            : ''
        }\n\n**Start**: <t:${
          new Date(tournament.startDate).getTime() / 1000
        }:D> - **End**: <t:${new Date(tournament.endDate).getTime() / 1000}:D>\n
        ${
          tournament.forumID
            ? `**[Forum Thread](https://osu.ppy.sh/community/forums/topics/${tournament.forumID})** `
            : ''
        }${
          tournament.website
            ? `${tournament.forumID ? '- ' : ''}**[Website](${
                tournament.website
              })** `
            : ''
        }${
          tournament.pickem
            ? `${
                tournament.forumID || tournament.website ? '- ' : ''
              }**[Pick'em](${tournament.pickem})**`
            : ''
        }`,
        color: 0x00ffff,
        image: {
          url: tournament.banner ?? '',
        },
        footer: {
          text: `Added by ${tournament.moderatorName}`,
          icon_url: `http://s.ppy.sh/a/${tournament.moderator}`,
        },
        timestamp: new Date().toISOString(),
      },
    ],
  };

  fetch(process.env.NEXT_PUBLIC_DISCORD_WH, {
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(jsonData),
  });

  return;
}

async function getUserData(id, token) {
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
  };

  let request = await fetch(`/api/osu/users/${id}`, {
    method: 'GET',
    headers,
  });
  request = await request.json();

  const data = {
    id: request.id,
    username: request.username,
  };

  return data;
}

async function postFormData(data) {
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

  data.host = data.host ? await getUserData(data?.host, data.token) : null;

  data.forumID = (await data?.forumID) === '' ? null : data.forumID;

  const response = await fetch('/api/tournaments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    return console.log(result.error);
  }

  await sendToDiscord(data);

  return 'sent';
}

export default function Form({ session }) {
  const [nameNewStage, setNameNewStage] = useState('');
  const [stages, setStages] = useState([]);

  const { register, handleSubmit } = useForm({
    defaultValues: {
      mod_NM: '1.00',
      mod_HD: '1.00',
      mod_HR: '1.00',
      mod_DT: '1.00',
      mod_EZ: '1.00',
      mod_FL: '1.00',
      mod_SD: '1.00',
      mod_HT: '1.00',
      moderator: session.id,
      moderatorName: session.username,
      token: session.access_token,
    },
  });

  return (
    <form id={styles.newTournamentForm} onSubmit={handleSubmit(postFormData)}>
      <label className={styles.main}>General</label>
      <label htmlFor="acronym">Acronym</label>
      <input
        type={'text'}
        {...register('acronym', { required: true })}
        placeholder={'Acronym'}
      />
      <label htmlFor="name">Name</label>
      <input
        type={'text'}
        {...register('name', { required: true })}
        placeholder={'Name'}
      />
      <label htmlFor="description">Description</label>
      <textarea {...register('description')} placeholder={'Description'} />
      <div className={styles.row}>
        <label htmlFor="host">Host ID</label>
        <input
          type={'number'}
          {...register('host')}
          placeholder={'Host user ID'}
        />
        <label htmlFor="requester">Requester ID</label>
        <input
          type={'number'}
          {...register('requester')}
          placeholder={'Requester ID'}
        />
        <label htmlFor="moderator">Moderator ID</label>
        <input
          type={'number'}
          {...register('moderator')}
          placeholder={'Moderator ID'}
          readOnly
        />
      </div>
      <label htmlFor="banner">Banner URL</label>
      <input type={'url'} {...register('banner')} placeholder={'Banner URL'} />
      <label className={styles.main}>Mods Multiplier</label>
      <div className={styles.row}>
        <label htmlFor="mod_NM">NM</label>
        <input
          type={'number'}
          step="0.01"
          {...register('mod_NM', { required: true })}
          placeholder={'NM Multiplier'}
        />
        <label htmlFor="mod_HD">HD</label>
        <input
          type={'number'}
          step="0.01"
          {...register('mod_HD', { required: true })}
          placeholder={'HD Multiplier'}
        />
      </div>
      <div className={styles.row}>
        <label htmlFor="mod_HR">HR</label>
        <input
          type={'number'}
          step="0.01"
          {...register('mod_HR', { required: true })}
          placeholder={'HR Multiplier'}
        />
        <label htmlFor="mod_DT">DT</label>
        <input
          type={'number'}
          step="0.01"
          {...register('mod_DT', { required: true })}
          placeholder={'DT Multiplier'}
        />
      </div>
      <div className={styles.row}>
        <label htmlFor="mod_EZ">EZ</label>
        <input
          type={'number'}
          step="0.01"
          {...register('mod_EZ', { required: true })}
          placeholder={'EZ Multiplier'}
        />
        <label htmlFor="mod_FL">FL</label>
        <input
          type={'number'}
          step="0.01"
          {...register('mod_FL', { required: true })}
          placeholder={'FL Multiplier'}
        />
      </div>
      <div className={styles.row}>
        <label htmlFor="mod_SD">SD</label>
        <input
          type={'number'}
          step="0.01"
          {...register('mod_SD', { required: true })}
          placeholder={'SD Multiplier'}
        />
        <label htmlFor="mod_HT">HT</label>
        <input
          type={'number'}
          step="0.01"
          {...register('mod_HT', { required: true })}
          placeholder={'HT Multiplier'}
        />
      </div>
      <label className={styles.main}>Links</label>
      <label>Forum ID</label>
      <input
        type={'number'}
        {...register('forumID')}
        placeholder={'Forum ID'}
      />
      <label>Website</label>
      <input
        type={'url'}
        {...register('website')}
        placeholder={'Website URL'}
      />
      <label>Pick&apos;em</label>
      <input type={'url'} {...register('pickem')} placeholder={"Pick'em URL"} />
      <label className={styles.main}>Dates</label>
      <label>Start</label>
      <input
        type={'date'}
        {...register('startDate', { required: true })}
        placeholder={'Start Date'}
      />
      <label>End</label>
      <input
        type={'date'}
        {...register('endDate', { required: true })}
        placeholder={'End Date'}
      />
      <label className={styles.main}>Stages</label>
      <div className={styles.row}>
        <input
          type="text"
          value={nameNewStage}
          placeholder={'Stage Name'}
          onChange={(e) => setNameNewStage(e.target.value)}
        />
        <button
          onClick={(e) => {
            e.preventDefault();
            if (nameNewStage.length >= 3) {
              setStages((prev) => [...prev, nameNewStage]);
              setNameNewStage('');
            }
          }}
        >
          +
        </button>
      </div>
      {stages.map((stage) => {
        return (
          <div key={stage} className={styles.row}>
            <label htmlFor={`stage_${stage}`}>{stage}</label>
            <input
              type={'date'}
              {...register(`stage_${stage}`, { required: true })}
              placeholder={'Start Date'}
            />
          </div>
        );
      })}
      <input type="submit" value="Submit Tournament" />
    </form>
  );
}
