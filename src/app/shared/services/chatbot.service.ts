import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface BotResponse {
  text: string;
  options?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private commonQuestions = [
    'What destinations do you offer?',
    'How do I book a trip?',
    'What are the ticket prices?',
    'What are your departure times?',
    'Is there a loyalty program?'
  ];

  private responses = new Map<string, string>([
    ['trip', 'We offer various exciting trips across Egypt. Would you like to see our available destinations?'],
    ['book', 'Booking a trip is easy! You can select your destination, choose your preferred date, and complete the booking through our website. Would you like me to guide you through the process?'],
    ['price', 'Our prices vary based on the destination and class of service. Which destination are you interested in?'],
    ['station', 'We have stations in major cities including Cairo, Alexandria, and Luxor. Would you like specific station details?'],
    ['cairo', 'We operate multiple daily trips to and from Cairo. Our buses depart every 2 hours from 6 AM to 10 PM. Would you like to see the schedule?'],
    ['alexandria', 'Alexandria trips run frequently throughout the day, with departures every hour from 5 AM to 11 PM. Shall I show you available times?'],
    ['luxor', 'We offer daily trips to Luxor, with morning and evening departures. Would you like to check the schedule?'],
    ['time', 'Our buses run on regular schedules throughout the day. Which route are you interested in?'],
    ['schedule', 'I can help you check the latest schedules. Which destination are you planning to visit?'],
    ['payment', 'We accept various payment methods including credit cards, debit cards, and mobile wallets. Would you like more details about payment options?'],
    ['cancel', 'Trips can be cancelled up to 24 hours before departure for a full refund. Would you like to know more about our cancellation policy?'],
    ['luggage', 'Each passenger is allowed one large suitcase and one carry-on bag. Would you like details about our baggage policy?'],
    ['wifi', 'Yes, all our buses are equipped with free Wi-Fi for passengers. Would you like to know about other onboard amenities?']
  ]);

  getResponse(message: string): Observable<BotResponse> {
    const lowercaseMsg = message.toLowerCase();
    let response: BotResponse = {
      text: 'I apologize, but I didn\'t quite understand your question. Could you please rephrase it or choose from these common topics?',
      options: this.commonQuestions
    };

    // Check for keywords in the message
    for (const [key, value] of this.responses.entries()) {
      if (lowercaseMsg.includes(key.toLowerCase())) {
        response = {
          text: value,
          options: ['Yes, please', 'No, thanks', 'Tell me more']
        };
        break;
      }
    }

    // Handle greetings
    if (lowercaseMsg.includes('hi') || lowercaseMsg.includes('hello')) {
      response = {
        text: 'Hello! Welcome to Ra7ala! How may I assist you today?',
        options: this.commonQuestions
      };
    }

    // Simulate network delay
    return of(response).pipe(delay(1000));
  }
}