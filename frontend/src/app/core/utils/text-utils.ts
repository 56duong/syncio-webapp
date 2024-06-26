import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})

export class TextUtils {
  /**
   * Copy text to the clipboard.
   * @param val - The text to copy to the clipboard.
   */
  async copyToClipboard(val: string) {
    try {
      await navigator.clipboard.writeText(val);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  }
}
