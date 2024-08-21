import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { AuthTokenInterceptorService } from './core/interceptors/auth-token-interceptor.service';
import { MessageService } from 'primeng/api';
import { DatePipe } from '@angular/common';

import { ReactiveFormsModule } from '@angular/forms';
import { CustomReuseStrategy } from './core/strategies/custom-reuse-strategy';
import { RouteReuseStrategy } from '@angular/router';
import { LangInterceptor } from './core/interceptors/lang.interceptor';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { SharedModule } from './shared/shared.module';
import { environment } from 'src/environments/environment';
import { AppInterceptor } from './core/interceptors/app.interceptor';
import { ServiceWorkerModule } from '@angular/service-worker';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, '/assets/i18n/', '.json');
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ButtonModule,
    MessagesModule,
    MessageModule,
    ToastModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
  providers: [
    MessageService,
    DatePipe,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthTokenInterceptorService,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LangInterceptor,
      multi: true,
    },
    { provide: RouteReuseStrategy, useClass: CustomReuseStrategy },
    ...((environment.android || environment.windows) 
        ? [{ provide: HTTP_INTERCEPTORS, useClass: AppInterceptor, multi: true }] 
        : [])
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
