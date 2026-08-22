import React from "react";
import { Image, StyleSheet, View } from "react-native";

const WORDMARK_ASPECT = 1559 / 412;
const MARK_ASPECT = 295 / 318;

interface CampaignHQLogoProps {
  /** Show only the mascot mark, without the "campaign HQ" wordmark. */
  markOnly?: boolean;
  /** Use the cream tile mark suited for dark backgrounds instead of the navy mark/wordmark. */
  variant?: "navy" | "cream";
  /** Pixel height to render the logo at. Width scales to match the source aspect ratio. */
  height?: number;
}

export function CampaignHQLogo({ markOnly, variant = "navy", height = 28 }: CampaignHQLogoProps) {
  if (variant === "cream") {
    return (
      <View style={[styles.tile, { width: height, height }]}>
        <Image
          source={require("../../assets/brand/campaignhq-mark-cream-tile.png")}
          style={{ width: height, height }}
          resizeMode="cover"
        />
      </View>
    );
  }

  if (markOnly) {
    const width = Math.round(height * MARK_ASPECT);
    return (
      <Image
        source={require("../../assets/brand/campaignhq-mark-navy.png")}
        style={{ width, height }}
        resizeMode="contain"
      />
    );
  }

  const width = Math.round(height * WORDMARK_ASPECT);
  return (
    <Image
      source={require("../../assets/brand/campaignhq-wordmark.png")}
      style={{ width, height }}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  tile: {
    borderRadius: 8,
    overflow: "hidden",
  },
});
