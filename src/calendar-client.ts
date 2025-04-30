import {
  Body,
  Controller,
  Get,
  Inject,
  Logger,
  Module,
  Post,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { authenticate } from '@google-cloud/local-auth';
import { calendar_v3, google } from 'googleapis';
import { join } from 'path';

const CALENDAR_TOKEN = 'CALENDAR_TOKEN';

class EventDateTime {
  /**
   * The time, as a combined date-time value (formatted according to RFC3339). A time zone offset is required unless a time zone is explicitly specified in timeZone.
   */
  dateTime?: string | null;
}

class CreateEventDTO {
  start: EventDateTime;
  end: EventDateTime;
  summary: string;
}

@Controller('calendars')
class CalendarController {
  private logger: Logger = new Logger('CalendarController');

  constructor(
    @Inject(CALENDAR_TOKEN)
    private googleCalendarService: calendar_v3.Calendar,
  ) {}

  @Get('/')
  async getFirstList() {
    const result = await this.googleCalendarService.calendarList.get({
      calendarId: 'primary',
    });

    return result.data;
  }

  @Get('/events')
  async getEvents() {
    const result = await this.googleCalendarService.events.list({
      maxResults: 1,
    });

    return result.data;
  }

  @Post('/')
  async createEvent(
    @Body() eventData: CreateEventDTO,
  ): Promise<calendar_v3.Schema$Event> {
    this.logger.log(`Attempting to create event in calendar: Dangphu2412`);

    const response = await this.googleCalendarService.events.insert({
      calendarId: 'primary',
      requestBody: eventData, // Pass the event data object here
    });

    this.logger.log(`Event created successfully: ${response.data.htmlLink}`);
    return response.data; // Return the created event object
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Make ConfigModule available globally
      envFilePath: '.env', // Specify your env file
    }),
  ],
  controllers: [CalendarController],
  providers: [
    {
      provide: CALENDAR_TOKEN,
      useFactory: async () => {
        const client = await authenticate({
          scopes: [
            'https://www.googleapis.com/auth/calendar.events', // Scope for read/write events
            'https://www.googleapis.com/auth/calendar.readonly',
          ],
          keyfilePath: join(process.cwd(), 'service_account.json'),
        });
        // @ts-expect-error The interface of Google is not supported yet
        return google.calendar({ version: 'v3', auth: client });
      },
    },
  ],
})
export class CalendarClientModule {}
