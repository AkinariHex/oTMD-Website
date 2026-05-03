'use client';

import generateApiKey from 'generate-api-key';
import { Copy, Eye, EyeSlash } from 'iconsax-react';
import { useState } from 'react';
import { Tooltip } from 'react-tippy';
import 'react-tippy/dist/tippy.css';
import styles from './ApikeySettings.module.css';

function ApikeySettings({ sessionID, api_key, UUID }) {
  const [hideAPI, setHideAPI] = useState(true);
  const [apikey, setApikey] = useState(api_key);

  function copyToClipboard() {
    navigator.clipboard.writeText(apikey);
  }

  async function createApikey(id, uuid) {
    const response = await fetch('/api/users/apikey', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId: id, uuid }),
    });

    const result = await response.json();

    if (!response.ok) {
      return console.log(result.error);
    }

    setApikey(result.api_key);
  }

  async function destroyApikey(id) {
    const response = await fetch('/api/users/apikey', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId: id }),
    });

    const result = await response.json();

    if (!response.ok) {
      return console.log('Error deleting apikey!');
    }

    setApikey("You haven't generated any apikey!");
    setHideAPI(false);
  }

  return (
    <div className={styles.section}>
      <div className={styles.subtitle}>o!TMD Apikey</div>
      <div className={styles.field}>
        <input
          type="text"
          placeholder="You haven't generated any apikey!"
          value={
            apikey !== undefined && apikey !== null && hideAPI
              ? '*********************************************'
              : apikey
          }
          disabled
        />
        {apikey !== undefined &&
        apikey !== null &&
        apikey !== "You haven't generated any apikey!" ? (
          hideAPI ? (
            <>
              <button
                onClick={() => setHideAPI((prev) => (prev ? false : true))}
              >
                <Eye size="18" color="#dadada" />
              </button>
              <Tooltip
                title="Copied!"
                position="right"
                trigger="click"
                arrow={false}
              >
                <button onClick={() => copyToClipboard()}>
                  <Copy size="18" color="#dadada" />
                </button>
              </Tooltip>
            </>
          ) : (
            <>
              <button
                onClick={() => setHideAPI((prev) => (prev ? false : true))}
              >
                <EyeSlash size="18" color="#dadada" />
              </button>
              <Tooltip
                title="Copied!"
                position="right"
                trigger="click"
                arrow={false}
              >
                <button onClick={() => copyToClipboard()}>
                  <Copy size="18" color="#dadada" />
                </button>
              </Tooltip>
            </>
          )
        ) : (
          ''
        )}
      </div>
      <div className={styles.buttons}>
        <button onClick={() => createApikey(sessionID, UUID)}>
          Generate Apikey
        </button>
        <button onClick={() => destroyApikey(sessionID)}>Destroy Apikey</button>
      </div>
    </div>
  );
}

export default ApikeySettings;
