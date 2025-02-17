import React from 'react';
import {PropTypes} from 'prop-types';

function MarkdownText(props){
    const doShorten = props.shorten && props.text?.length > props.shorten;
    const [isExpanded, setIsExpanded] = React.useState(doShorten ? false : true);
    const processLinks = function(text){
        const result = [];
        const parts = text.split('](');
        if(parts.length > 1){
            for(let i = 1; i < parts.length; i++){
                // get link label
                const p = parts[i - 1].split('[');
                if(p.length > 1){
                    const label = p.pop();
                    // Now find the url
                    const u = parts[i].split(')');
                    if(u.length > 1){
                        const url = u[0];
                        result.push(<React.Fragment key={result.length}>{p.join('[')}</React.Fragment>);
                        result.push(<a href={url} key={result.length} target="_blank" rel="noreferrer">
                            {label}
                        </a>);
                        parts[i] = u.slice(1).join(')');
                    }else{
                        // Not a valid link found
                        result.push(<React.Fragment key={result.length}>{parts[i - 1]}</React.Fragment>);
                    }
                }else{
                    // No valid link found
                    result.push(<React.Fragment key={result.length}>{parts[i - 1]}</React.Fragment>);
                }
            }
            result.push(<React.Fragment key={result.length}>{parts.pop()}</React.Fragment>);
            return <>{result}</>;
        }
        return text;
    };

    const fomattedTextTypes = [
        {
            pattern: '__',
            render: (content, props) => (
                <span className="zol-markdown-text-underline" {...props} key={props.key}>
                    {content}
                </span>
            )
        },
        {
            pattern: '*',
            render: (content, props) => (<em {...props} key={props.key}>{content}</em>)
        },
        {
            pattern: '**',
            render: (content, props) => (<strong {...props} key={props.key}>{content}</strong>)
        },
        {
            pattern: '***',
            render: (content, props) => (<strong {...props} key={props.key}><em>{content}</em></strong>)
        },
        {
            pattern: '\r',
            render: (content, props) => (<React.Fragment {...props} key={props.key}>
                <br/>{content}
            </React.Fragment>)
        }
    ];
    const formatText = (inputString, inputTypes = fomattedTextTypes) => {
        const types = [...inputTypes];
        const type = types.pop();
        const list = inputString.split(type.pattern).reduce((list, words, index) => {
            const content = types.length > 0 ? formatText(words, types) : processLinks(words);
            list.push(list.length % 2 === 0 ?
                <React.Fragment key={index}>{content}</React.Fragment> :
                type.render(content, {key: index}));
            return list;
        }, []);
        return list;
    };

    const text = doShorten && ! isExpanded ?
            props.text.substring(0, props.shorten) + '...' : props.text;

    const description = text.replace(/<br>/g, '\n').split('\n').map((line, index) => {
        line = line.trim();
        let isListItem = false;
        let isHeaderItem = false;
        if(line.length > 3 && line.substring(0, 2) === '- '){
            isListItem = true;
            line = line.substring(2);
        }else if(line.length > 3 && line.substring(0, 3) === '## '){
            isHeaderItem = true;
            line = line.substring(3);
        }
        const list = formatText(line);
        return <p key={index}
                className={'zol-markdown-text-' + (isListItem ? 'list' : (isHeaderItem ? 'header' : 'text'))}>
            {list}
        </p>;
    });

    return <div className="zol-markdown-text">
        {description}
        {doShorten ?
            <button className={'btn-link zol-markdown-read-' + (isExpanded ? 'less' : 'more')}
                    onClick={() => {setIsExpanded(!isExpanded);}}>
                {isExpanded ? 'Read less' : 'Read more'}
            </button> :
            null
        }
    </div>;
}

MarkdownText.propTypes = {
    text: PropTypes.string.isRequired,
    shorten: PropTypes.number
};

export {MarkdownText};
