import styles from './TournamentStatusBar.module.css';

function formatDate(date) {
  let options = { year: 'numeric', month: 'long', day: 'numeric' };
  date = new Date(date);
  return date.toLocaleDateString('en-US', options);
}

export default function TournamentStatusBar({ start, end, status }) {
  return (
    <div className={styles.statusBar}>
      <div>
        <h3>Start:</h3> {formatDate(start)}
      </div>
      <div>
        <h3>End:</h3> {formatDate(end)}
      </div>
      <div>
        <h3>Status:</h3>{' '}
        <span className={styles[status.class]}>{status.text}</span>
      </div>
    </div>
  );
}
