/**
 * SearchInput — Molecule
 * Barra de pesquisa com possibilidade de inserção de texto
 * para busca de infomação
 */
import React from "react";
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Input } from '@/components/atoms/Input/Input';
import { Button } from '@/components/atoms/Button/Button';
import { Ionicons } from '@expo/vector-icons';
import {BorderRadius, Colors, Spacing} from '@/theme';
import type { SearchInputProps } from './SearchInput.types';

export function SearchInput({
    isRequired,
    style,
    onSearchPress,
    placeholder,
    value,
    ...inputProps }: SearchInputProps) {
    const handleSearch = () => {
        if (onSearchPress) onSearchPress();
    }

    return (
        <View style={styles.mainContainer}>
            <Input containerStyle={styles.searchContainer} inputStyle={styles.searchInput} placeholder={placeholder} placeholderTextColor={Colors.textMuted} value={value} {...inputProps} />
            <Button label="" rightIcon={<Ionicons name="search" size={Spacing.md} color={Colors.textSecondaryDark} />}  style={styles.searchButton} containerStyle={styles.searchButton} onPress={handleSearch} />
        </View>
    );
}

const styles = StyleSheet.create({
    searchButton: {
        borderRadius: BorderRadius.pill,
        backgroundColor: Colors.transparent,
        paddingLeft: Spacing.xs,
        paddingRight: Spacing.sm,
    },  
    mainContainer: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: Colors.primaryLight,
        borderRadius: BorderRadius.pill,
        borderStyle: 'solid',
        marginHorizontal: Spacing.sm,
        backgroundColor: Colors.surfaceDark,
    },
    searchContainer: {
        flexGrow: 1,
        borderWidth: 0,
        backgroundColor: Colors.transparent,
        paddingVertical: 0,
        paddingRight: Spacing.xs,
        paddingLeft: Spacing.md,
        
    },
    searchInput: {
        color: Colors.textPrimaryDark,
    },
});
