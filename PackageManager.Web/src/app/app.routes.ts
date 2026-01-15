import { Routes } from '@angular/router';
import { PackagesListComponent } from './components/packages-list/packages-list.component';
import { PackageEditorComponent } from './components/package-editor/package-editor.component';
import { SettingsComponent } from './components/settings/settings.component';

export const routes: Routes = [
  { path: '', component: PackagesListComponent },
  { path: 'package/new', component: PackageEditorComponent },
  { path: 'package/:id', component: PackageEditorComponent },
  { path: 'settings', component: SettingsComponent },
  { path: '**', redirectTo: '' }
];
