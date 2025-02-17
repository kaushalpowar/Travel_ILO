
class SkiplinkIndex {
    // Global mapping of all the SkiplinkSections
    static index = new Map();

    /**
     * Add a SkiplinkSection to the index
     * @param {string} id unique id of the section
     * @param {object} properties Object containing 'path', 'label' or 'labbeledby' and 'element'
     */
    static addSection(id, properties){
        if(SkiplinkIndex.index.has(id)){
            console.warn('Overriding existing section ' + id + ' in SkiplinkIndex.');
        }
        SkiplinkIndex.index.set(id, properties);
    }

    /**
     * Removing the section with the given id
     * @param {string} id unique id of the section
     */
    static removeSection(id){
        SkiplinkIndex.index.delete(id);
    }

    /**
     * Returning the ordered index of all SkiplinkSections
     */
    static getIndex(){
        const tree = {children: {}, id: 'root', element: document.body};
        for(const [id, properties] of SkiplinkIndex.index.entries()){
            let node = tree;
            const path = properties.path.length > 1 ?
                    properties.path.slice(0, properties.path.length - 1) : [];
            for(const parent of path){
                if(! node.children[parent]){
                    node.children[parent] = {children: {}};
                }
                node = node.children[parent];
            }

            let label = properties.label || ('Section ' + id);
            // If the section has a labelledby property, it means the title is defined in another element with
            // id given in this property. We try to find it and populate the label with the textContent of the
            // node.
            if(properties.labelledby){
                const elm = document.getElementById(properties.labelledby);
                if(elm){
                    label = elm.textContent;
                }
            }
            node.children[id] = {
                id,
                label,
                element: properties.element,
                children: node.children[id] ? node.children[id].children : {}
            };
        }
        SkiplinkIndex._orderTreeItems(tree);
        return tree;
    }

    /**
     * Sorting the the tree based on the order of its children appearing in the DOM structure of the document
     * @param {object} tree the SkiplinkSection tree
     */
    static _orderTreeItems(tree){
        // deteriming the location of the child in the DOM tree
        for(const child of Object.values(tree.children)){
            const domRank = [];
            let node = child.element;
            if(node){
                let parent = node.parentNode;
                while(node !== tree.element && node !== document.body){
                    domRank.unshift(Array.from(parent.childNodes).indexOf(node));
                    node = parent;
                    parent = node.parentNode;
                }
            }else{
                // DOM element not found for item
                domRank.unshift(-1);
            }
            child.domRank = domRank;
            // recursive call to children, to order them also
            SkiplinkIndex._orderTreeItems(child);
        }

        // Create a sorted array of children
        tree.children = Object.values(tree.children).sort((a, b) => {
            for(let i = 0; i < Math.min(a.domRank.length, b.domRank.length); i++){
                if(b.domRank[i] === -1 || a.domRank[i] < b.domRank[i]){
                    return -1;
                }else if(a.domRank[i] === -1 || a.domRank[i] > b.domRank[i]){
                    return 1;
                }
            }
            return 0; // we may get here when elements are not found
        });
    }
}

export {SkiplinkIndex};
