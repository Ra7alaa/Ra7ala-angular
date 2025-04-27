import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

// Import services from our core module
import { ThemeService } from './themes/theme.service';
import { LanguageService } from './localization/language.service';
import { TranslationService } from './localization/translation.service';
import { PermissionService } from './services/permission.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HttpClientModule, // Required for TranslationService to load JSON files
  ],
  providers: [
    // Core services
    ThemeService,
    LanguageService,
    TranslationService,
    PermissionService,
  ],
  exports: [],
})
export class CoreModule {
  // Prevent reimporting the CoreModule
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error(
        'CoreModule is already loaded. Import it only in AppModule.'
      );
    }
  }
}
