import React from 'react'; 

export default class Chat extends React.Component {
  async componentDidMount() {
    if (!window.rmlLoaded) {
      window.rmlLoaded = true;
      window.rmlCalls = {};

      // Cannot be a ES6 arrow function.
      window.rml = function() {
        let ri = arguments[1].roomElementID;
        if (!window.rmlCalls[ri]) window.rmlCalls[ri] = [];
        window.rmlCalls[ri].push(arguments);
      };

      let s = document.createElement('script');
      s.setAttribute('src', 'https://embed.roomlio.com/embed.js');
       document.body.appendChild(s);
    }

    window.rml('config', {
      options: {
        embedPosition: 'inline',
        collapsedMode: 'none',

        greetingMessageUsername: 'TeaLink',
        greetingMessage: 'Welcome. Let\'s hear the `Tea',
      },
      widgetID: 'wgt_ca84d068osqr9mgs9j7g',
      pk: 'yhDxPcyPjooMjLskA2eRPE7Q77U1uY9hjQOAklTU-Bq0',
      // Replace with the ID of the room-containing element.
      roomElementID: 'rml-room-1',
    });

    window.rml('register', {
      options: {
        roomKey: 'EGewTvo664QoN8FTJhlK8zR8TJeUusaqDCOm-yQ3t27g',
      },
      // Replace with the ID of the room-containing element.
      roomElementID: 'rml-room-1',
    });
  }

  componentWillUnmount() {}

  render() {
    return (
        <div className={'Chat'}>
             <div
        id="rml-room-1"
        data-rml-room
        data-rml-version="09.mar.2020"
      />
        </div>
       
    );
  }
}
