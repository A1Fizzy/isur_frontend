import 'react-big-calendar';

declare module 'react-big-calendar' {
  interface Event {
    id?: number;
  }
}