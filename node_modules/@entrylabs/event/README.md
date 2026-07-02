# entry-event [![npm version](https://badge.fury.io/js/%40entrylabs%2Fevent.svg)](https://badge.fury.io/js/%40entrylabs%2Fevent) [![Build Status](https://travis-ci.org/entrylabs/entry-event.svg?branch=master)](https://travis-ci.org/entrylabs/entry-event) 

> Entry에서 이벤트관리를 보다 쉽게 사용하기 위해 만든 패키지

## 설치

```bash
$ yarn add @entrylabs/event
```

## 사용법

```javascript
import Event from '@entrylabs/event';

const target = new Event(document);
target.on('click', e => {console.log(e.type)});
target.trigger('click');
target.off('click');
```

## 라이센스

MIT © [entrydev@nts-corp.com]()
