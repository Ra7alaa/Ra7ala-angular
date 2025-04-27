import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsComponent } from './pages/settings/settings.component';
import { ThemeSettingsComponent } from './components/theme-settings/theme-settings.component';
import { LanguageSettingsComponent } from './components/language-settings/language-settings.component';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from './pipes/translate.pipe';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    SettingsRoutingModule,
    // Import standalone components
    SettingsComponent,
    ThemeSettingsComponent,
    LanguageSettingsComponent,
    TranslatePipe,
  ],
  exports: [TranslatePipe],
})
export class SettingsModule {}
