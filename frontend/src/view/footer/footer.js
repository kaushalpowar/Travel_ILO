import React from 'react';
import './footer.scss';
import '../quote.scss';
import {ReactComponent as IconTwitter} from '../../assets/icons/twitter.svg';
import {ReactComponent as IconFacebook} from '../../assets/icons/facebook.svg';
import {ReactComponent as IconMail} from '../../assets/icons/envelope-regular.svg';
import {SkiplinkNavigation} from '../../helpers/elements/skiplink/navigation.js';
import {SkiplinkSection} from '../../helpers/elements/skiplink/section.js';

function ViewFooter(){
    const title = encodeURIComponent('ILO');
    // eslint-disable-next-line max-len
    const shareText = encodeURIComponent('ILO');
    const url = encodeURIComponent('https://www.ilo.org/');
    const twitterUrl = 'https://twitter.com/share?text=' + shareText + '&url=' + url +
            '&hashtags=worldofwork';
    const facebookUrl = 'https://www.facebook.com/sharer/sharer.php?u=' + url + '&t=' + title;
    const mailUrl = 'mailto:?subject=' + title + '&body=' + shareText + encodeURIComponent(' Visit: ') + url;

    return <footer className="ilo-footer">
        <SkiplinkSection className="ilo-footer-inner" label="Footer">

            <div className="ilo-footer-top">
                <span className="ilo-footer-contact">
                    Contact us:&nbsp;
                    <a href="mailto:info@ilo.org">info@ilo.org</a>
                </span>
                <span className="ilo-footer-links">
                    <a href="https://www.ilo.org/global/copyright/lang--en/index.htm">Copyright</a>
                    <a href="https://www.ilo.org/global/privacy-policy/lang--en/index.htm">Privacy policy</a>
                    <a href="https://www.ilo.org/global/fraud-alert/lang--en/index.htm">Fraud alert</a>
                    <a href="https://www.ilo.org/global/disclaimer/lang--en/index.htm">Disclaimer</a>
                </span>
            </div>

            <div className="ilo-footer-logo-line">
                <div className="ilo-footer-logo">
                    <a href="http://www.ilo.org/">ILO</a>
                </div>

                <div className="ilo-quote">
                    <h3>
                        Advancing social justice, promoting decent work
                    </h3>
                    <span>ILO is a specialized agency of the United Nations</span>
                </div>

                <div style={{clear: 'both'}}/>
            </div>

            <div className="ilo-footer-disclaimer-container">
                <span className="ilo-footer-share">
                    <a href={twitterUrl} target="_blank" rel="noopener noreferrer"
                            title="Share page on Twitter">
                        <IconTwitter/>
                    </a>
                    <a href={facebookUrl} target="_blank" rel="noopener noreferrer"
                            title="Share page on Facebook">
                        <IconFacebook/>
                    </a>
                    <a href={mailUrl} title="Share page by email"><IconMail/></a>
                </span>
            </div>
        </SkiplinkSection>
        <SkiplinkNavigation/>
    </footer>;
}

export {ViewFooter};
