class EntryEvent {
    _dom;
    _data;
    constructor(dom) {
        if (!dom) {
            throw new Error('dom is undefined');
        }
        if (!EntryEvent.elementMap) {
            EntryEvent.elementMap = new Map();
        }
        this.dom = dom;
    }

    set dom(dom) {
        this._dom = dom;
    }

    get dom() {
        return this._dom;
    }

    set data(data) {
        this._data = data;
    }

    get data() {
        return this._data;
    }

    destroy() {
        this.off();
        this._data = null;
        this._dom = null;
    }

    on = (types, callback, option = false) => {
        if (!types) {
            return this;
        }
        const trimTypes = types.trim();
        trimTypes.split(' ').forEach((type) => {
            const eventMap = EntryEvent.elementMap.get(this.dom) || {};
            if (eventMap[type]) {
                eventMap[type].push(callback);
            } else {
                eventMap[type] = [callback];
            }
            EntryEvent.elementMap.set(this.dom, eventMap);
            this.addEvent(type, callback, option);
        });

        return this;
    };

    off(types = '', callback, option = false) {
        const trimTypes = types.trim();
        trimTypes.split(' ').forEach((type) => {
            const eventMap = EntryEvent.elementMap.get(this.dom) || {};
            Object.entries(eventMap).forEach(([key, value = []]) => {
                const filtered = value.filter((func) => {
                    if (!callback || callback === func) {
                        if (type === key) {
                            this.removeEvent(type, func, option);
                            return false;
                        } else if (type === '') {
                            this.removeEvent(key, func, option);
                            return false;
                        } else if (key.indexOf('.') > -1 && type.indexOf('.') === -1) {
                            const [event, namespace = ''] = key.split('.');
                            const [e, n] = this.getEventName(type);
                            if (e === event || n === namespace) {
                                this.removeEvent(key, func, option);
                                return false;
                            }
                        }
                    }
                    return true;
                });
                if (filtered.length) {
                    eventMap[key] = filtered;
                } else {
                    delete eventMap[key];
                }
            });
            EntryEvent.elementMap.set(this.dom, eventMap);
        });
        return this;
    }

    getType(type) {
        return type.split('.')[0];
    }

    getEventName(type) {
        if (type.indexOf('.') > -1) {
            return type.split('.');
        } else {
            return [type, type];
        }
    }

    addEvent(type, callback, option) {
        this.dom.addEventListener(this.getType(type), callback, option);
    }

    removeEvent(type, callback, option) {
        this.dom.removeEventListener(this.getType(type), callback, option);
    }

    trigger(type, event = {}) {
        if(!type) {
            return console.warn('%cEntryEvent: %ctype argument empty', "color: blue; font-weight: bold;", "");
        }
        const eventMap = EntryEvent.elementMap.get(this.dom) || {};
        Object.entries(eventMap).forEach(([key, value = []]) => {
            let triggerFunc = false;
            if (type === key) {
                triggerFunc = true;
            } else if (key.indexOf('.') > -1 && type.indexOf('.') === -1) {
                const [event, namespace = ''] = key.split('.');
                const [e, n] = this.getEventName(type);
                if (e === event && n === namespace) {
                    triggerFunc = true;
                }
            }
            if(triggerFunc) {
                value.forEach((func) => func(event));
            }
        });
    }
}

export default EntryEvent;
