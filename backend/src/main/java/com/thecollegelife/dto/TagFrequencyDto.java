package com.thecollegelife.dto;

public class TagFrequencyDto {

    private String tag;
    private long count;

    public TagFrequencyDto() {
    }

    public TagFrequencyDto(String tag, long count) {
        this.tag = tag;
        this.count = count;
    }

    public String getTag() {
        return tag;
    }

    public void setTag(String tag) {
        this.tag = tag;
    }

    public long getCount() {
        return count;
    }

    public void setCount(long count) {
        this.count = count;
    }
}
