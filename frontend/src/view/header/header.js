import React from 'react';
import './header.scss';
import '../quote.scss';
import {SkiplinkElementNav, SkiplinkSection} from '../../helpers/elements/skiplink/section.js';

function ViewHeader(){
    return <header>
        <div className="header-top">
            <div className="header-top-blue"/>
            <div className="content-row">
                <div className="header-top-content">
                    <a href="http://www.ilo.org/">Go to ILO main website</a>
                </div>
            </div>
        </div>
        <div className="header-main">
            <div className="content-row">
                <div className="logo">
                    <a href="http://www.ilo.org/">ILO</a>
                </div>
                <h1>
                    {/* A hash symbol is a valid href value. Eslint should not complain */}
                    {/* eslint-disable-next-line */}
                    <a href="/">AI Travel Assistant Demo</a>
                </h1>

                <div className="ilo-quote">
                    <h3>
                        Advancing social justice, promoting decent work
                    </h3>
                    <span>ILO is a specialized agency of the United Nations</span>
                </div>
            </div>
        </div>

        <SkiplinkSection className="header-menu-container" label="Main navigation"
                Element={SkiplinkElementNav}>
            <div className="header-menu">
                <ul className={'header-menu-desktop'} role="menu">
                    <li role="menuitem">
                        <a href="/" className="nav-link-item nav-link-item-active">
                            Travel Assistant
                        </a>
                    </li>
                </ul>
            </div>
        </SkiplinkSection>

    </header>;
}

export {ViewHeader};
