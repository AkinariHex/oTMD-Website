import styles from './TournamentStagesBar.module.css';

export default function TournamentStagesBar({ stages }) {
  var prevDate = null;

  return (
    <div className={styles.progressbarContainer}>
      <h3>Stages</h3>
      <ol className={styles.progressBar}>
        {stages.stages.map((stage, index) => {
          let todayDate = new Date();
          let stageDate = new Date(stage.date);
          let oldDate = prevDate;
          prevDate = stageDate;
          return (
            <li
              key={index}
              className={
                todayDate > stageDate && todayDate > oldDate
                  ? styles.isComplete
                  : todayDate <= stageDate && todayDate > oldDate
                  ? styles.isActive
                  : ''
              }
            >
              <span>{stage.stage}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
