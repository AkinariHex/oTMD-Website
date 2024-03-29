import React from 'react';

function Footer() {
  let year = new Date().getFullYear();

  return (
    <div className="footer">
      <div className="app">
        <div className="icon">
          <object
            type="image/svg+xml"
            data="/img/otmdLOGO.svg"
            className="logoAppHeader"
            alt="otmd logo"
            loading="lazy"
          />
        </div>
        <div className="copyright">
          © {year} <a href="https://osu.ppy.sh/users/4001304">Akinari</a>
        </div>
        <div className="affiliation">
          Not affiliated with <a href="https://osu.ppy.sh">osu.ppy.sh</a>
        </div>
      </div>
      <div className="links">
        <div className="column">
          <div className="header">Tablet Covers</div>
          <a href="https://foxbox.io/discount/AKINARI">
            <img src="/img/foxbox.png" alt="Foxbox Akinari" />
          </a>
        </div>
        <div className="column">
          <div className="header">Cool osu! stuff</div>
          <div className="list">
            <div className="item">
              <a href="https://oma.hwc.hr/" rel="noreferrer" target="_blank">
                osu! matchmaking
              </a>
            </div>
            <div className="item">
              <a
                href="https://osu.ppy.sh/community/forums/topics/879262"
                rel="noreferrer"
                target="_blank"
              >
                chat4osu!
              </a>{' '}
              by <a href="https://osu.ppy.sh/users/1874761">hallowatcher</a>
            </div>
            <div className="item">
              <a
                href="https://osucollector.com/"
                rel="noreferrer"
                target="_blank"
              >
                osu!Collector
              </a>{' '}
              by <a href="https://osu.ppy.sh/users/2051389">FunOrange</a>
            </div>
            <div className="item">
              <a
                href="https://mutualify.stanr.info/"
                rel="noreferrer"
                target="_blank"
              >
                Mutualify
              </a>{' '}
              by <a href="https://osu.ppy.sh/users/7217455">StanR</a>
            </div>
            <div className="item">
              <a href="https://ronnia.me/" rel="noreferrer" target="_blank">
                Ronnia
              </a>{' '}
              by <a href="https://osu.ppy.sh/users/5642779">heyronii</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Footer;
